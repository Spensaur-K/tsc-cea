"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts = __importStar(require("typescript"));
const fs_1 = require("fs");
const path_1 = require("path");
const src = ts.createSourceFile("test.ts", fs_1.readFileSync(path_1.resolve(__dirname, "../samples/test.ts"), { encoding: "utf8" }), ts.ScriptTarget.ESNext, true);
require("./sem");
src.forEachChild(function foo(node) {
    if (ts.isFunctionDeclaration(node)) {
        console.log(`Function declr at position: ${node.pos} to ${node.end}`);
        node.body.forEachChild(foo);
    }
    else if (ts.isExpressionStatement(node)) {
        node.expression.forEachChild(foo);
    }
    else if (ts.isCallExpression(node)) {
        console.log("Call expr");
    }
    else if (ts.isIdentifier) {
    }
    else {
        console.log(`Node: ${ts.SyntaxKind[node.kind]}`);
    }
});
//# sourceMappingURL=index.js.map