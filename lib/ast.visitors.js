'use strict'

class DrawAst {

  constructor(ts) {

    this.ts = ts
    this.tree = ''
    this.visitor = this.visitor.bind(this)
  }

  visitor(node, level)  {

    this.tree += '|'

    for(var i=0; i <= level; i++) { this.tree += '--' }

    this.tree += `[${this.ts.SyntaxKind[node.kind]}:${node.text ? node.text : ''}]\n`

    return false
  }
}

/**
 * Put the nodes that correspond to export declarations in the #nodes array
 *
 * @returns {{exports: Array, visitor: visitor}}
 * @private
 */
class FindExportNodes {

  constructor(ts) {

    this.ts = ts
    this.nodes = []
    this.visitor = this.visitor.bind(this)
  }

  visitor(node) {

    // as per the source code, the root node has a statements property that we can search
    // alternatively, we need look only at the first level nodes search for those that are ExportAssignment
    // or contain a child ExportKeyword
    if (node.kind === this.ts.SyntaxKind.ExportKeyword) {
      this.nodes.push(node.parent)
    }
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
  function findExportNodes(ast) {

    const obj = new FindExportNodes(ts)

    ts.tdgTraverseAst(ast, obj.visitor)

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

  function dangerouslyDrawOriginalAst(ast) {

    const obj = new DrawAst(ts)

    ts.tdgDangerouslyTraverseOriginalAst(ast, obj.visitor)

    return obj.tree
  }

  function drawAst(ast) {

    const obj = new DrawAst(ts)

    ts.tdgTraverseAst(ast, obj.visitor)

    return obj.tree
  }


  return {
    findExportNodes,
    findMatches,
    dangerouslyDrawOriginalAst,
    drawAst
  }
}


module.exports = {
  bindAstVisitors
}
