"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../src/must_execute");
var R;
(function (R) {
    class Foo {
        constructor() {
            this.x = -1;
            Foo.readify();
            if (R.Foo.readify.mustHaveExecuted()) {
                console.log("YES!");
            }
            else {
                console.log("NO!");
            }
        }
        static readify() {
        }
    }
    R.Foo = Foo;
})(R || (R = {}));
const f = new R.Foo;
//# sourceMappingURL=method.js.map