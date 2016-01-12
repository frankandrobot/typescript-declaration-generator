declare module 'TestModule' {

    var foo : string

    var bar : {() : string}

    export interface IBaz {
        baz()
    }
}
