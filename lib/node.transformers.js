function bindNodeTransformers(opt) {

  return function createNodeTransformers(_opt) {

    const ts = _opt.ts


    function exportVariableStatement(filename, node, ast) {

      if (node.kind === ts.SyntaxKind.VariableStatement) {

        return node.data.declarationList.declarations.map((declaration, i) => {

          return Object.assign(_identifierAndType(filename, declaration, ast), {

            declarationType: _declarationType(node.data.declarationList)
          })
        })
      }
    }

    function _declarationType(declarationList) {

      var declarationType = 'var'

      declarationType = declarationList.flags & ts.NodeFlags.Let ? 'let' : declarationType
      declarationType = declarationList.flags & ts.NodeFlags.Const ? 'const' : declarationType

      return declarationType
    }

    function _identifierAndType(filename, declaration, root) {

      const identifier = declaration.name.text
      const type = ts.tdgNodeType(filename, declaration, root)

      return {identifier, type}
    }

    return {
      exportVariableStatement
    }
  }
}

module.exports = {
  bindNodeTransformers
}
