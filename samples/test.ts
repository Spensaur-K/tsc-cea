import "../src/must_execute";

function main() {
    function foo() {

    }
    if (Math.random()) {
        foo();
    } else {
        foo();
    }
    if (foo.mustHaveExecuted()) {
        console.log("YES!");
    } else {
        console.log("NO!");
    }
}

main();
