const ts = require('typescript')
const stringify = require('json-stringify-safe')
const readFileSync = require('fs').readFileSync

const sourceFile = ts.createSourceFile('./greeter.ts', readFileSync('./greeter.ts').toString(), ts.ScriptTarget.ES6, true);

/**
 * traverses tree, applying the visitor function on each node.
 * Stops as soon as the visitor function returns true
 *
 * @param ast
 * @returns {{kind: *}}
 */
function _traverseTree(ast, visitorFunc) {

  function _tree(nodes) {

    if (!nodes.forEach) { nodes = [nodes] }

    const result = nodes.reduce((result, node) => result || visitorFunc(node), false);

    if (!result) {

      for(var i=0; i<nodes.length; i++) {

        ts.forEachChild(nodes[i], _tree, _tree)
      }
    }
  }

  ts.forEachChild(
    ast,
    _tree,
    _tree
  )
}

function collectExports() {

  const exports = []

  return {
    exports,
    visitor: function(node) {
      if (node.kind === ts.SyntaxKind.ExportKeyword) {
        exports.push(node.parent)
      }
    }
  }
}

const _exports = collectExports()

_traverseTree(sourceFile, _exports.visitor)

console.log(stringify(_exports.exports,null,1))

_traverseTree(sourceFile, (node) => console.log(ts.SyntaxKind[node.kind]))