'use strict'

/**
 * This is the node class for the in-house AST
 */
class TdgNode {

  constructor(ts, node) {

    /**
     * Human readable type (aka "kind")
     */
    this._kind = ts.SyntaxKind[node.kind]
    this.data = node
    this.children = []
  }

  get kind() { return this.data.kind }
}

/**
 * Does what it says
 */
class GatherFirstLevelChildrenInOriginalAst {

  constructor() {

    this.nodes = []

    this.visitor = this.visitor.bind(this)
  }

  visitor(node, level) {

    if (level >= 2) { // exit if level >= 2

      return true
    }
    else if (level === 1) {

      this.nodes = this.nodes.concat([node])
      return false;
    }
    else if (level === 0) {

      return false
    }
  }
}

class Writer {

  constructor() {
    this.result = '';
  }

  writeKeyword(text) { this.result += text }

  writeOperator(text) { this.result += text }

  writePunctuation(text) { this.result += text }

  writeSpace(text) { this.result += text }

  writeStringLiteral(text) { this.result += text }

  writeParameter(text) { this.result += text }

  writeSymbol(text, symbol) { this.result += text }

  writeLine() {}

  increaseIndent() {}

  decreaseIndent() {}

  clear() { this.result = '' }

  trackSymbol() { }

}



function bindTsPlus(opt) {

  const fs = opt.fs
  const ts = opt.ts
  const P = opt.P
  const _ = opt._
  const path = opt.path

  const readFile = P.promisify(fs.readFile)


  /**
   * This is the entry point.
   *
   * You get the original ts object + a program, a typechecker, and the in-house ASTs for each file
   *
   * @param filenames
   */
  return function createTsPlus(filenames) {

    filenames = Array.isArray(filenames) ? filenames : [filenames]


    const tdgProgram = ts.createProgram(filenames, {target: ts.ScriptTarget.ES6, module: ts.ModuleKind.ES6});

    const tdgTypeChecker = tdgProgram.getDiagnosticsProducingTypeChecker()

    /**
     * emitResolvers indexed by (relative) filename
     * @type {*|{}}
     */
    const tdgEmitResolvers = filenames.map(_relativeFilename).reduce((emitResolvers, filename) => {

      return Object.assign(emitResolvers, _.zipObject([filename], [tdgTypeChecker.getEmitResolver(filename)]))
    }, {})

    /**
     * the ASTs in an array
     * @type {Array|U[]}
     */
    const tdgAstArray = tdgProgram.getSourceFiles()
      // source files also include system files, so exclude these
      .filter(sourceFile =>
        filenames.map(_relativeFilename).find(filename => filename === _relativeFilename(sourceFile.fileName))
      )
      // then transform AST
      .map(tdgDangerouslyTransformOriginalAst)

    /**
     * The same ASTs wrapped in a Promise
     */
    const tdgAst = new P(resolve => resolve(tdgAstArray))


    function _relativeFilename(filename) {

      const relativeFilename = path.isAbsolute(filename) ? path.relative(__dirname, filename) : path.normalize(filename)

      return relativeFilename.replace(/(.*)\.ts$/, '$1')
    }


    /**
     * You probably don't want to use this. Calling "dangerously" so you don't use by accident
     *
     * One reason is because this AST lacks type
     *
     * @param filename
     * @returns {*}
     * @private
     */
    function tdgDangerouslyCreateOriginalAst(filename) {

      return readFile(filename).then(file => ts.createSourceFile(filename, file.toString(), ts.ScriptTarget.ES6, true))
    }

    /**
     * You probably don't want to use this. Calling "dangerously" so you don't use by accident
     *
     * traverses tree, applying the visitor function on each node.
     * Stops if the visitor function returns true
     *
     * Visitor function has signature { (node,level) : boolean }
     *
     * @param ast
     * @returns {{kind: *}}
     */
    function tdgDangerouslyTraverseOriginalAst(ast, visitorFunc) {

      function _tree(nodes, level) {

        if (!nodes.forEach) { nodes = [nodes] }

        const result = nodes.reduce((result, node) => result || visitorFunc(node, level), false);

        if (!result) {

          for (var i = 0; i < nodes.length; i++) {

            ts.forEachChild(
              nodes[i],
              nodes => _tree(nodes, level + 1),
              nodes => _tree(nodes, level + 1)
            )
          }
        }
      }

      if (!visitorFunc(ast, 0)) {

        ts.forEachChild(
          ast,
          nodes => _tree(nodes, 1),
          nodes => _tree(nodes, 1)
        )
      }
    }

    /**
     * Converts the microsoft AST to what's used in this library
     *
     * @param originalAst
     * @returns {TdgNode}
     */
    function tdgDangerouslyTransformOriginalAst(originalAst) {

      const tdgAst = new TdgNode(ts, originalAst)

      const findChildren = new GatherFirstLevelChildrenInOriginalAst()

      tdgDangerouslyTraverseOriginalAst(tdgAst.data, findChildren.visitor)

      tdgAst.children = findChildren.nodes.map(tdgDangerouslyTransformOriginalAst)

      return tdgAst
    }

    /**
     * traverses tree, applying the visitor function on each node.
     * Stops if the visitor function returns true
     *
     * Visitor function has signature { (node,level) : boolean }
     *
     * @param ast
     * @param visitorFunc
     */
    function tdgTraverseAst(ast, visitorFunc) {

      if (!visitorFunc(ast, 0)) {

        _tdgTraverseAst(ast, 1, visitorFunc)
      }
    }

    function _tdgTraverseAst(ast, level, visitorFunc) {

      const result = ast.children.reduce((_result, child) => _result || visitorFunc(child, level), false)

      if (!result) {

        ast.children.forEach(child => _tdgTraverseAst(child, level + 1, visitorFunc))
      }
    }

    function tdgNodeType(filename, node, parent) {

      const emitResolver = tdgEmitResolvers[_relativeFilename(filename)]

      const writer = new Writer()
      emitResolver.writeTypeOfDeclaration(node, parent, undefined, writer)

      return writer.result
    }

    /**
     * Note that this ALWAYS returns an array
     *
     * @param node
     * @param syntaxKind
     * @returns {*}
     */
    function tdgChild(node, syntaxKind) {

      return node.children.filter(child => child.kind === syntaxKind)
    }


    return Object.assign(ts, {
      tdgProgram,
      tdgTypeChecker,
      tdgEmitResolvers,
      tdgAstArray,
      tdgAst,
      tdgDangerouslyCreateOriginalAst,
      tdgDangerouslyTraverseOriginalAst,
      tdgDangerouslyTransformOriginalAst,
      tdgTraverseAst,
      tdgNodeType,
      tdgChild,
      TdgNode
    })
  }
}

module.exports = {
  bindTsPlus
}
