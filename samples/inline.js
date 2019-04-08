"use strict";
class Foo {
    constructor() {
        (() => {
            foo: {
                this.x = 42;
            }
        })();
        this.readify();
    }
    readify() {
        this.x = 42;
    }
}
const f = new Foo();
//# sourceMappingURL=inline.js.map