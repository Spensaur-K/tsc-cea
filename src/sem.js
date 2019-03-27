"use strict";
/**
 * Use symbolic execution
 * Used noGratuitousExpressionsRule.ts for reference
 */
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts = __importStar(require("typescript"));
const SymbolicExecution_1 = require("./sonarts/sonarts-core/src/se/SymbolicExecution");
const builder_1 = require("./sonarts/sonarts-core/src/cfg/builder");
const programStates_1 = require("./sonarts/sonarts-core/src/se/programStates");
const symbolicValues_1 = require("./sonarts/sonarts-core/src/se/symbolicValues");
const constraints_1 = require("./sonarts/sonarts-core/src/se/constraints");
const builder_2 = require("./sonarts/sonarts-core/src/symbols/builder");
const sonarAnalysis_1 = require("./sonarts/sonarts-core/src/utils/sonarAnalysis");
const nodes_1 = require("./sonarts/sonarts-core/src/utils/nodes");
const truthy = constraints_1.isTruthy;
class Visitor extends sonarAnalysis_1.TypedSonarRuleVisitor {
    constructor(program, symbols) {
        super("CEA", program);
        this.symbols = symbols;
    }
    visitFunctionLikeDeclaration(node) {
        const statements = Visitor.getStatements(node);
        if (statements) {
            const initialState = programStates_1.createInitialState(node, this.program);
            const shouldTrackSymbol = (symbol) => true;
            /*this.symbols
                .allUsages(symbol)
                .filter(usage => usage.is(UsageFlag.WRITE))
                .every(usage => firstLocalAncestor(usage.node, ...FUNCTION_LIKE) === node);*/
            this.runForStatements(Array.from(statements), initialState, shouldTrackSymbol);
        }
        super.visitFunctionLikeDeclaration(node);
    }
    static getStatements(functionLike) {
        if (nodes_1.isArrowFunction(functionLike)) {
            // `body` can be a block or an expression
            if (nodes_1.isBlock(functionLike.body)) {
                return functionLike.body.statements;
            }
        }
        else {
            return functionLike.body && functionLike.body.statements;
        }
        return undefined;
    }
    runForStatements(statements, initialState, shouldTrackSymbol) {
        const cfg = builder_1.build(statements);
        if (cfg === undefined) {
            console.error("No CFG generated");
            return;
        }
        const result = SymbolicExecution_1.execute(cfg, this.symbols, initialState, shouldTrackSymbol);
        if (result === undefined) {
            console.error("Symbolic execution no result");
            return;
        }
        const tyc = symbolicValues_1.SymbolicValueType;
        const cyc = constraints_1.ConstraintKind;
        const lastBlock = cfg.end.predecessors[0].getElements();
        const consoleLog = lastBlock[lastBlock.length - 1];
        const statesAtConsoleLog = result.programNodes.get(consoleLog);
        const foo = this.symbols.getSymbols().filter(symbol => symbol.name == "foo")[0];
        for (const state of statesAtConsoleLog) {
            const fooSV = state.sv(foo);
            const fooConstraints = state.getConstraints(fooSV);
            debugger;
        }
        result.branchingProgramNodes.forEach((states, branchingProgramPoint) => {
            console.log(branchingProgramPoint.text);
            if (Visitor.ifAllProgramStateConstraints(states, truthy)) {
                debugger;
            }
            else if (Visitor.ifAllProgramStateConstraints(states, constraints_1.isFalsy)) {
                debugger;
            }
            cfg;
        });
    }
    static ifAllProgramStateConstraints(programStates, checker) {
        return programStates.every(programState => {
            const [sv] = programState.popSV();
            return sv !== undefined && checker(programState.getConstraints(sv));
        });
    }
}
function analyze(sourceFile, program) {
    const symbols = builder_2.SymbolTableBuilder.build(sourceFile, program);
    const visitor = new Visitor(program, symbols);
    visitor.visit(sourceFile);
}
const { compilerOptions } = require("../tsconfig.json");
compilerOptions.lib = [];
const path_1 = require("path");
const target = path_1.resolve(__dirname, "../samples/test.ts");
const prog = ts.createProgram([target], compilerOptions);
const src = prog.getSourceFile(target);
analyze(src, prog);
//# sourceMappingURL=sem.js.map