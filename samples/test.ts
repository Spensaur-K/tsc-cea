import "../src/must_execute";


function helper(baz: () => void) {
    baz();
}

function main(foo: () => void) {
    helper(foo);
    if (foo.mustHaveExecuted()) {
        console.log("YES!");
    } else {
        console.log("NO!");
    }
}

main(() => 0);



