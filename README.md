The algorithm is simple:

assumes:
 - ES6 imports only
 - every file is a module (so no namespaces)
 - consumed by an ES6 application
 
given the entry point/index file:

1. Get a list of everything exported
2. Create a module using the filename and base package name.
   - if the index file, then just use the base package name
   - otherwise, build the module name from the base package name and filename
   Example:

   ```
   declare 'Foobar' {
   }
   
   declare 'Foobar/Baz' {
   }
   ```
3. Add all the exported things to the module:
   - if a variable, declare the variable
   - if a function, declare the function declaration
   - if a type, export the type
   - if an interface, export the interface
   - if a class, export the class *interface*; if an interface doesn't exist, require that it exists 
   - if an object, require that an interface exists, and use that
   
   Example
   
   ```
   declare 'Foobar' {
      export interface foo{
         bar(baz : IBaz)
      }
   }
   ```
4. Gather list of all dependencies (ex: in `function bar(baz : IBaz)`, `IBaz` is a dependency
   - if dep is defined in file, then include in module
   - otherwise, open file where declare and apply Steps 1--4 (recursion)