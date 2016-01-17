function bindGenerators(opt) {

  const ts = opt.ts

  function exportVariableStatement(filename, node) {

    if (node.kind === ts.SyntaxKind.VariableStatement) {

      const declareVariable = node.declarationList.declarations.reduce((lines, declaration) => {

        console.log(opt.stringify(declaration,null,1))
        const identifier = declaration.name.text
        const type = 'foo'//ts.tdgNodeType(filename, declaration)

        return `${lines}\ndeclare var ${identifier} : ${type}`
      }, '')

      return declareVariable
    }
  }


  return {
    exportVariableStatement
  }
}

module.exports = {
  bindGenerators
}
