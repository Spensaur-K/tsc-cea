"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../src/must_execute");
function main() {
    function A() {
        console.log(`🎉🎊`);
    }
    function B() {
        A();
    }
    function C(f) {
        // Here we don't know what F points to!
        f();
    }
    C(B);
    // At this point, has A been executed?
}
main();
//# sourceMappingURL=3_passing.js.map