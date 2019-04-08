import "../src/must_execute";

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
    } else {
        console.log("NO!");
    }
}

main();


