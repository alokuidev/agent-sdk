"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = exports.AgentBuilder = void 0;
const config_1 = require("./config");
class AgentBuilder {
    constructor() {
        this.toolList = [];
    }
    setInstructions(instructions) {
        this.instructions = instructions;
        return this;
    }
    tool(t) {
        var _a;
        (_a = this.toolList) === null || _a === void 0 ? void 0 : _a.push(t);
        return this;
    }
    build() {
        return new Agent(this);
    }
}
exports.AgentBuilder = AgentBuilder;
class Agent {
    constructor(builder) {
        var _a;
        this.toolMap = new Map();
        for (const t of builder.toolList || []) {
            this.toolMap.set(t.name, t);
        }
        this.instructions = `
        
        ${config_1.HARNESS_PROMPT}\n\n
        System Prompt: ${builder.instructions}

        Available Tools:
        ${(_a = builder.toolList) === null || _a === void 0 ? void 0 : _a.map(t => JSON.stringify({ functionName: t.name, functionDescription: t.description, functionDoc: t.doc })).join('\n')}
        `;
        this.messageHistory = [];
    }
    static builder() {
        return new AgentBuilder();
    }
    printSystemPrompt() {
        console.log(this.instructions);
    }
    run(input) {
        console.log(`Running agent with input: ${input}`);
    }
}
exports.Agent = Agent;
