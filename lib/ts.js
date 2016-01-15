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


    ts.forEachChild(
      ast,
      nodes => _tree(nodes, 0),
      nodes => _tree(nodes, 0)
    )
  }


  return Object.assign(ts, {
    tdgCreateAst,
    tdgTraverseTree
  })
}

module.exports = {
  bindTs
}
