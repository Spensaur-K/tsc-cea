"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts = __importStar(require("typescript"));
const stack_trace_1 = __importDefault(require("stack-trace"));
const SymbolicExecution_1 = require("./sonarts/sonarts-core/src/se/SymbolicExecution");
const builder_1 = require("./sonarts/sonarts-core/src/cfg/builder");
const programStates_1 = require("./sonarts/sonarts-core/src/se/programStates");
const constraints_1 = require("./sonarts/sonarts-core/src/se/constraints");
const builder_2 = require("./sonarts/sonarts-core/src/symbols/builder");
const navigation_1 = require("./sonarts/sonarts-core/src/utils/navigation");
const nodes_1 = require("./sonarts/sonarts-core/src/utils/nodes");
const visitor_1 = require("./sonarts/sonarts-core/src/utils/visitor");
const stateTransitions_1 = require("./sonarts/sonarts-core/src/se/stateTransitions");
const { compilerOptions } = require("../tsconfig.json");
// From SonarTS
function getStatements(functionLike) {
    if (nodes_1.isArrowFunction(functionLike)) {
        // `body` can be a block or an expression
        if (nodes_1.isBlock(functionLike.body)) {
            return Array.from(functionLike.body.statements);
        }
    }
    else {
        return (functionLike.body && Array.from(functionLike.body.statements));
    }
    return (undefined);
}
class FunctionCallFinder extends visitor_1.TreeVisitor {
    constructor(src) {
        super();
        this.src = src;
        this.result = null;
        this.line = -1;
    }
    visitCallExpression(node) {
        nope: if (nodes_1.isPropertyAccessExpression(node.expression)) {
            const methodName = node.expression.name.getText();
            if (methodName !== "mustHaveExecuted") {
                break nope;
            }
            //const line = this.src.getLineAndCharacterOfPosition(node.expression.getStart()).line + 1;
            //if (this.line - line < 2) {
            this.result = node;
            // Line numbers don't work, fuck it
            //    return;
            //}
        }
        super.visitCallExpression(node);
    }
    find(line) {
        this.line = line;
        this.result = null;
        this.visit(this.src);
        return this.result;
    }
}
const results = {};
const programs = {};
function symbolicAnalysis(fileName, enclosingFunc) {
    const [prog, src, symbols] = programs[fileName];
    const stmts = getStatements(enclosingFunc);
    const cfg = builder_1.build(stmts);
    const ps = programStates_1.createInitialState(enclosingFunc, prog);
    const result = SymbolicExecution_1.execute(cfg, symbols, ps, () => true, interproceduralExecutionCheck(fileName));
    return result;
}
const analyzedProcedures = new Map();
function analyzeFunctionDeclaration(fileName, func) {
    const [prog, , symbols] = programs[fileName];
    const stmts = getStatements(func);
    const cfg = builder_1.build(stmts);
    const ps = programStates_1.createInitialState(func, prog);
    const result = SymbolicExecution_1.execute(cfg, symbols, ps, () => true, interproceduralExecutionCheck(fileName));
    const answers = (new Array(func.parameters.length)).fill(true);
    const pss = result.programNodes.get(cfg.end) || [];
    func.parameters.forEach((param, i) => {
        const symbol = param.symbol;
        answers[i] = answers[i] && alwaysExecuted(pss, symbol);
    });
    const closure = symbols.allUsagesInside(func)
        .map(usage => usage.symbol)
        .filter(symbol => alwaysExecuted(pss, symbol));
    return { parameters: answers, closure };
}
function interproceduralExecutionCheck(fileName) {
    const [prog, src, symbols] = programs[fileName];
    function check(callExpression) {
        const usage = symbols.getUsage(callExpression.expression);
        if (usage && usage.symbol.declarations.length > 0) {
            const declaration = usage.symbol.declarations[0];
            if (nodes_1.isFunctionLikeDeclaration(declaration)) {
                if (analyzedProcedures.has(declaration)) {
                    return analyzedProcedures.get(declaration);
                }
                else {
                    const result = analyzeFunctionDeclaration(fileName, declaration);
                    analyzedProcedures.set(declaration, result);
                    return result;
                }
            }
        }
        return stateTransitions_1.InterProcedural.Default;
    }
    return check;
}
function alwaysExecuted(pss, func) {
    return pss.every(ps => constraints_1.isExecuted(ps.getConstraints(ps.sv(func))));
}
function getTargetFunctionSymbol(callSite, symbols) {
    const kinder = ts.SyntaxKind;
    const k = kinder[callSite.kind];
    let id;
    if (nodes_1.isCallExpression(callSite)) {
        if (nodes_1.isPropertyAccessExpression(callSite.expression)) {
            if (nodes_1.isPropertyAccessExpression(callSite.expression.expression)) {
                id = callSite.expression.expression.name;
            }
            else if (nodes_1.isIdentifier(callSite.expression.expression)) {
                id = callSite.expression.expression;
            }
            else {
                throw "up";
            }
        }
        else {
            throw "up";
        }
    }
    else {
        throw "up";
    }
    const targetFuncSymbol = symbols.getUsage(id).symbol;
    return targetFuncSymbol;
}
Function.prototype.mustHaveExecuted = function () {
    const err = new Error();
    const trace = stack_trace_1.default.parse(err)[1];
    const fileName = trace.getFileName().replace(/\.js$/, ".ts");
    const funcName = trace.getFunctionName();
    const lineNumber = trace.getLineNumber();
    const prog = ts.createProgram([fileName], compilerOptions);
    const src = prog.getSourceFile(fileName);
    const symbols = builder_2.SymbolTableBuilder.build(src, prog);
    programs[fileName] = [prog, src, symbols];
    const key = fileName + funcName;
    let result;
    const callFinder = new FunctionCallFinder(src);
    const callSite = callFinder.find(lineNumber);
    const enclosingFunc = navigation_1.firstLocalAncestor(callSite, ...navigation_1.FUNCTION_LIKE);
    if (nodes_1.isFunctionLikeDeclaration(enclosingFunc)) {
        if (key in results) {
            result = results[key];
        }
        else {
            result = results[key] = symbolicAnalysis(fileName, enclosingFunc);
        }
    }
    else {
        throw "up";
    }
    let foo;
    const targetFuncSymbol = getTargetFunctionSymbol(callSite, symbols);
    const ps = result.programNodes.get(callSite);
    return alwaysExecuted(result.programNodes.get(callSite), targetFuncSymbol);
};
//# sourceMappingURL=must_execute.js.map