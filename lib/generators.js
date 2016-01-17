function bindGenerators(opt) {

  const ts = opt.ts

  function exportVariableStatement(filename, node) {

    if (node.kind === ts.SyntaxKind.VariableStatement) {

      const declarationList = ts.tdgChildren(node)[ts.SyntaxKind.VariableDeclarationList][0]
      const declarationListChildren = ts.tdgChildren(declarationList)[ts.SyntaxKind.VariableDeclaration]

      declarationListChildren.forEach(declaration => {

       // console.log(declaration)
        const declarationChildren = ts.tdgChildren(declaration)[ts.SyntaxKind.Identifier]
        console.log(declarationChildren)

      })
      //console.log(opt.stringify(declarationList,null,1))
      // ts AST is dumb this way... you have to call tdgChildren (again) to really get the children
      //const realDeclarationList = ts.tdgChildren(declarationList).VariableDeclaration
      //
      //console.log(Object.keys(realDeclarationList))
      //console.log(opt.astVisitors.drawTree(declarationList))
      //
      ////onsole.log(realDeclarationList)
      //realDeclarationList.forEach(declaration => console.log(ts.SyntaxKind[declaration.kind]))

      return ''
    }
  }


  return {
    exportVariableStatement
  }
}

module.exports = {
  bindGenerators
}
