'use strict'

class DrawAst {

  constructor(ts) {

    this.ts = ts
    this.tree = ''
    this.visitor = this.visitor.bind(this)
  }

  visitor(node, level)  {

    for(var i=0; i <= level; i++) { this.tree += '  ' }

    this.tree += `|--[${this.ts.SyntaxKind[node.kind]}]\n`

    return false
  }
}


function bindAstVisitors(opt) {

  const ts = opt.ts

  /**
   * Find nodes that are export statements
   *
   * @returns {{exports: Array, visitor: visitor}}
   * @private
   */
  function findExportNodes(rootAst) {

    return rootAst.children.reduce((exportNodes, child) => {

      //if the root-level child has an ExportKeyword child, then it's an export node
      return child.children.find(grandchild => grandchild.kind === ts.SyntaxKind.ExportKeyword) ?
        exportNodes.concat([child]) :
        exportNodes
    }, [])
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

  function drawAst(ast) {

    function _traverseAst(node, level, visitorFunc) {

      visitorFunc(node, level)

      for (var child of node.children) {

        _traverseAst(child, level + 1, visitorFunc)
      }
    }

    const obj = new DrawAst(ts)

    _traverseAst(ast, 0, obj.visitor)

    return obj.tree
  }


  return {
    findExportNodes,
    findMatches,
    drawAst
  }
}


module.exports = {
  bindAstVisitors
}
