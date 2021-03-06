const deps = require('./service.locator.js')

const createTsPlus = deps.createTsPlus
const createAstVisitors = deps.createAstVisitors
const createNodeTransformers = deps.createNodeTransformers


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


//ts.tdgCreateAst('./test/input5.ts')
//  .then(ast => astVisitors.findMatches(ast, '1234'))
//  .map(node => ts.tdgNodeType('./test/input5.ts', node))
//  //.map(info => console.log(info.checker.symbolToString()))
//
//ts.tdgCreateAst('./test/input5.ts')
//  .tap(ast => console.log(ast.statements.map(s=>ts.SyntaxKind[s.kind])))
//  .then(ast => astVisitors.drawTree(ast))
//  .tap(console.log)

const ts = createTsPlus('./test/input5.ts')
const astVisitors = createAstVisitors({ts})
const nodeTransformers = createNodeTransformers({ts})

ts.tdgAst
  .then(astArray => astArray[0])
  .tap(ast => console.log(astVisitors.drawAst(ast)))
  .then(ast => { return {ast, exportNodes: astVisitors.findExportNodes(ast)}; })
  .then(astWithExports => astWithExports.exportNodes.map(e => { return {exportNode: e, ast: astWithExports.ast}}))
  .map(exportsWithAst =>
    nodeTransformers.exportVariableStatement('./test/input5.ts', exportsWithAst.exportNode, exportsWithAst.ast)
  )
  .tap(console.log)
