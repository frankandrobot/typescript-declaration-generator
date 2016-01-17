'use strict'

class FindChildrenInOriginalAst {

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


function bindTs(opt) {

  const fs = opt.fs
  const ts = opt.ts
  const P = opt.P
  const _ = opt._

  const readFile = P.promisify(fs.readFile)


  class TdgNode {

    constructor(node) {

      this.data = node
      this.children = []
    }

    get _kind() { return ts.SyntaxKind[this.data.kind] }
    get kind() { return this.data.kind }
  }


  /**
   * You probably don't want to use this. Calling "dangerously" so you don't use by accident
   *
   * Wrapper for getting the AST from a file
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

  function tdgCreateAst(filename) {

    function _transformAst(ast) {

      const tdgAst = new TdgNode(ast)

      const findChildren = new FindChildrenInOriginalAst()

      tdgDangerouslyTraverseOriginalAst(tdgAst.data, findChildren.visitor)

      tdgAst.children = findChildren.nodes.map(_transformAst)

      return tdgAst
    }

    return tdgDangerouslyCreateOriginalAst(filename).then(originalAst => _transformAst(originalAst))
  }

  /**
   * Not really needed anymore because new AST is so simple
   *
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

  function tdgNodeType(filename, node) {

    const program = ts.createProgram([filename], {});
    const typeChecker = program.getTypeChecker()

    const typeObj = typeChecker.getTypeAtLocation(node)[0]

    return typeObj ? typeObj.intrinsicName : null
  }



  return Object.assign(ts, {
    tdgDangerouslyCreateOriginalAst,
    tdgDangerouslyTraverseOriginalAst,
    tdgCreateAst,
    tdgTraverseAst,
    tdgNodeType,
    TdgNode
  })
}

module.exports = {
  bindTs
}
