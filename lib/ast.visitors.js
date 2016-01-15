function bindAstVisitors(opt) {

  const ts = opt.ts

  /**
   * Put the nodes that correspond to export declarations in the #nodes array
   *
   * @returns {{exports: Array, visitor: visitor}}
   * @private
   */
  function _findExportNodesObj() {

    const nodes = []

    return {

      nodes,

      visitor: node => {

        if (node.kind === ts.SyntaxKind.ExportKeyword) {
          nodes.push(node.parent)
        }
      }
    }
  }

  function findExportNodes(ast) {

    const obj = _findExportNodesObj()

    ts.tdgTraverseTree(ast, obj.visitor)

    return obj.nodes
  }

  /**
   * Convenience function that finds a node with a property that resolves to #name
   *
   * @param name
   * @returns {{matchNodes: Array, visitor: visitor}}
   * @private
   */
  function _findMatchesObj(name) {

    const nodes = []

    return {

      nodes,

      visitor: node => {

        // console.log(node)
        const matches = Object.keys(node).reduce((total, key) => {

          return total.length ?
            total :
            total.concat(node[key] === name ? [node] : [])
        }, [])

        matches.forEach(match => nodes.push(match))
      }
    }
  }

  function findMatches(ast, name) {

    const obj = _findMatchesObj(name)

    ts.tdgTraverseTree(ast, obj.visitor)

    return obj.nodes
  }

  function _drawTreeObj(ast) {

    var tree = ''

    return {

      get tree() { return tree },

      visitor: (node, level) => {

        tree += '|'

        for(var i=0; i <= level; i++) { tree += '--' }

        tree += `[${ts.SyntaxKind[node.kind]}:${node.text ? node.text : ''}]\n`
      }
    }
  }

  function drawTree(ast) {

    const obj = _drawTreeObj(ast)

    ts.tdgTraverseTree(ast, obj.visitor)

    return obj.tree
  }


  return {
    findExportNodes,
    findMatches,
    drawTree
  }
}


module.exports = {
  bindAstVisitors
}
