function bindGenerators(opt) {

  const ts = opt.ts

  function exportVariableStatement(filename, node) {

    if (node.kind === ts.SyntaxKind.VariableStatement) {

      // there should be only one...but this is microsoft so you never know!
      const declarationList = ts.tdgChild(node, ts.SyntaxKind.VariableDeclarationList)[0]
      const declarations = ts.tdgChild(declarationList, ts.SyntaxKind.VariableDeclaration)

      return declarations.reduce((exportStatements, declaration) => {

        // assume a VariableDeclaration has only two children---identifier and value
        // again...this is an assumption
        const identifier = ts.tdgChild(declaration, ts.SyntaxKind.Identifier)[0].data.text
        const type = declaration.children
          // get whatever is not an identifier
          .filter(child => child.kind !== ts.SyntaxKind.Identifier)
          // then look up it's type
          .map(value => ts.tdgNodeType(filename, value.data))

        return `${exportStatements}\nvar ${identifier} : ${type[0]}`
      }, '')
    }
  }


  return {
    exportVariableStatement
  }
}

module.exports = {
  bindGenerators
}
