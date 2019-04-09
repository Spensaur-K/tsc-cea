"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../src/must_execute");
function main() {
    let x;
    function q() {
        x = 42; // Initialize x here
    }
    function enclosed(q) {
        q();
    }
    if (Math.random() === 0.004378439) {
        enclosed(q);
    }
    else {
        while (1) {
            enclosed(q);
            break;
        }
    }
    if (q.mustHaveExecuted()) {
        // x has been initialized, we can use it!
        console.log(x);
    }
    else {
        throw "up"; // x has not been initialized
    }
}
main();
//# sourceMappingURL=1_simple.js.map