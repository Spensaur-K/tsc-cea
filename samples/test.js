"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../src/must_execute");
let foo;
if (Math.random() > 0.5) {
    foo = function () {
        console.log(foo);
    };
}
else {
    foo = null;
}
function main() {
    function target() {
    }
    foo();
    if (foo) {
        target();
    }
    if (target.mustHaveExecuted()) {
        console.log("YES!");
    }
    else {
        console.log("NO!");
    }
}
main();
//# sourceMappingURL=test.js.map