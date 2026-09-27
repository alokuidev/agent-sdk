"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = exports.AgentBuilder = void 0;
class AgentBuilder {
    constructor() { }
    setInstructions(instructions) {
        this.instructions = instructions;
        return this;
    }
    build() {
        return new Agent(this);
    }
}
exports.AgentBuilder = AgentBuilder;
class Agent {
    constructor(builder) { }
    static builder() {
        return new AgentBuilder();
    }
    run(input) {
        console.log(`Running agent with input: ${input}`);
    }
}
exports.Agent = Agent;
