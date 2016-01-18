function bindGenerators(opt) {

  const ts = opt.ts

  function exportVariableStatement(filename, node) {

    if (node.kind === ts.SyntaxKind.VariableStatement) {

      // there should be only one...but this is microsoft so you never know!
      const declarationList = ts.tdgChild(node, ts.SyntaxKind.VariableDeclarationList)[0]
      const declarations = ts.tdgChild(declarationList, ts.SyntaxKind.VariableDeclaration)

      return declarations.map(declaration => {

        const obj = _identifierAndType(filename, declaration)

        return `${_declarationType(declarationList)} ${obj.identifier} : ${obj.type}`
      })
    }
  }

  function _declarationType(declarationList) {

    var declarationType = 'var'

    declarationType = declarationList.data.flags & ts.NodeFlags.Let ? 'let' : declarationType
    declarationType = declarationList.data.flags & ts.NodeFlags.Const ? 'const' : declarationType

    return declarationType
  }

  function _identifierAndType(filename, declaration) {

    // there are several cases:
    // 1. (Identifier, FirstLiteralToken/StringLiteral/ObjectLiteralExpression...leaf) (ex: const foo = bar)
    // 2. (Identifier, AsExpression/BinaryExpression/...node) (ex: const foo = 1 + 2)
    //
    // for case 1, the interesting case is (Identifier, Identifer) (ex: const foo = bar)
    // in this case, #tdgNodeType can't figure out what the type is (it doesn't work on identifiers)
    //
    // for case 2, ditto
    //
    // in such cases, we require an explicit type on the variable

    const identifier = declaration.children[0].data.text
    const value = declaration.children[1].data
    const type = ts.tdgNodeType(filename, value)

    return {identifier, type}
  }

  return {
    exportVariableStatement
  }
}

module.exports = {
  bindGenerators
}
