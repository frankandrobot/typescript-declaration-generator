function bindTs(opt) {

  const fs = opt.fs
  const ts = opt.ts
  const P = opt.P

  const readFile = P.promisify(fs.readFile)


  /**
   * Wrapper for getting the AST from a file
   *
   * @param filename
   * @returns {*}
   * @private
   */
  function tdgCreateAst(filename) {

    return readFile(filename).then(file => ts.createSourceFile(filename, file.toString(), ts.ScriptTarget.ES6, true))
  }

  /**
   * traverses tree, applying the visitor function on each node.
   * Stops if the visitor function returns true
   *
   * Visitor function has signature { (node,level) : boolean }
   *
   * @param ast
   * @returns {{kind: *}}
   */
  function tdgTraverseTree(ast, visitorFunc) {

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

  function tdgNodeType(filename, node) {

    const program = ts.createProgram([filename], {});
    const typeChecker = program.getTypeChecker()

    const typeObj = typeChecker.getTypeAtLocation(node)[0]

    return typeObj ? typeObj.intrinsicName : null
  }

  function _findChildrenObj() {

    var nodes = []

    return {

      get nodes() { return nodes },

      visitor: (node, level) => {

        return level >= 2 ? nodes = nodes.concat([node]) : true // exit if not in level 1
      }
    }
  }

  function tdgChildren(node) {

    const obj = _findChildrenObj()

    tdgTraverseTree(node, obj.visitor)

    return obj.nodes;
  }


  return Object.assign(ts, {
    tdgCreateAst,
    tdgTraverseTree,
    tdgNodeType,
    tdgChildren
  })
}

module.exports = {
  bindTs
}
