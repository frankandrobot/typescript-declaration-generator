- external module = ES6 module
- lines are in node.statements under SourceFile node

# Intro
Note that the source code doesn't use terminology consistently.
For example, there are `FunctionDeclaration`, `ModuleDeclaration`, `ImportEqualsDeclaration`, `InterfaceDeclaration`, but `VariableStatement`

And it gets even better, in the AST, nodes aren't uniform. For example, variable statements seem to be a special case.

# Node
## .flags
Used to tell whether node is exported. See checker#determineIfDeclarationIsVisible

# Export statements
- there are ExportDeclarations and ExportAssignments

## ExportAssignment
```
export default 'foo'
```
## ExportDeclaration
have no idea

## \*Declarations that export
```
export const foo = 'hello' # VariableStatement with child ExportKeyword!
```

# VariableStatement
## VariableDeclarationList
- every variable/assgnment is a VariableDeclaration stored a variable declaration list
- the variable name is in Identifier
- the variable value is in a \*Literal
