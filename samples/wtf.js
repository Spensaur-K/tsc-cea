"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../src/must_execute");
function baz() {
}
function helper(f) {
    f();
}
function main() {
    helper(baz);
    if (baz.mustHaveExecuted()) {
        console.log("YES!");
    }
    else {
        console.log("NO!");
    }
}
main();
//# sourceMappingURL=wtf.js.map