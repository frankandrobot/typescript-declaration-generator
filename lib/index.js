const deps = require('./service.locator.js')

const ts = deps.ts
const astVisitors = deps.astVisitors


function _generateModuleDeclaration(basePackageName, exportNodes) {

  return `
declare module '${basePackageName}' {

  ${exportNodes.map(exp => ts.getTextOfNode(exp, true)).join('\n')}
}
`
}


/*_createAST('./test/input1.ts')
  .then(ast => _traverseTree(ast, _exports.visitor))
  .then(() => _generateModuleDeclaration('Foobar', _exports.nodes))
  .tap(console.log)*/
/*

const _matches = _findMatchesObj('IFoo')

_createAST('./test/input3.ts')
  .then(ast => _traverseTree(ast, _matches.visitor))
  .then(() => _matches.nodes)
  .then(matchNodes => matchNodes.map(match => ts.getTextOfNode(match.parent, true) + ts.SyntaxKind[match.parent.kind]))
  .then(result => result.join('\n'))
  .tap(console.log)

*/

//_createAST('./test/input4.ts')
// .then(ast => _traverseTree(ast, node => { console.log(ts.SyntaxKind[node.kind], stringify(node,null,1)) }))
/*

const program = ts.createProgram(['./test/input5.ts'], {});
const typeChecker = program.getTypeChecker()
_createAST('./test/input5.ts')
  .then(ast => _findMatches(ast, '1234'))
  .map(node => {

    const type = typeChecker.getTypeAtLocation(node);

    return type
  })
  .tap(console.log)*/

ts.tdgCreateAst('./test/input5.ts')
  .then(ast => astVisitors.drawTree(ast))
  .tap(console.log)
