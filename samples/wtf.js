"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../src/must_execute");
function baz() {
}
function helper() {
    baz();
}
function main() {
    if (Math.random() == -5) {
        helper();
    }
    if (baz.mustHaveExecuted()) {
        console.log("YES!");
    }
    else {
        console.log("NO!");
    }
}
main();
//# sourceMappingURL=wtf.js.map