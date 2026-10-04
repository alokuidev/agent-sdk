"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = exports.AgentBuilder = void 0;
require("dotenv/config");
const config_1 = require("./config");
const openai_1 = __importDefault(require("openai"));
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
        this.MAX_LOOP = 30;
        this.toolMap = new Map();
        const apiKey = process.env.OPENAI_API_KEY || "";
        this.openai = new openai_1.default({ apiKey });
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
    parseAssistantJson(raw) {
        const trimmed = raw.trim();
        const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        const jsonText = fenceMatch ? fenceMatch[1].trim() : trimmed;
        return JSON.parse(jsonText);
    }
    run(input) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            this.messageHistory.push({ role: 'user', content: input });
            for (let i = 0; i < this.MAX_LOOP; i++) {
                //... LLMResponse = call LLM(Message History + System Prompt);
                const llmResponse = yield this.openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: this.instructions
                        },
                        ...this.messageHistory.map(m => ({
                            role: m.role,
                            content: m.content
                        }))
                    ]
                });
                const rawLLMResponse = (_a = llmResponse.choices[0].message) === null || _a === void 0 ? void 0 : _a.content;
                //Append LLMResponse to messageHistory
                this.messageHistory.push({ role: 'assistant', content: rawLLMResponse });
                //prase LLMResponse to JSON
                const parsedResult = this.parseAssistantJson(rawLLMResponse);
                // if LLMResponse.step === "OUTPUT" then break (Stop Condition)
                if (parsedResult.step.toLowerCase() === "output")
                    return this.messageHistory;
                // if LLMResponse.step === "TOOL_REQUEST" 
                /*
                * tool = toolMap.find (LLMResponse.functionName)
                * toolResult = await tool.executer(LLMResponse.input)
                * Append toolResult to messageHistory
                * Continue loop
                */
                if (parsedResult.step.toLowerCase() === "tool_request") {
                    const { functionName, input } = parsedResult;
                    const tool = this.toolMap.get(functionName);
                    if (!tool)
                        throw new Error(`Tool ${functionName} not found`);
                    const toolResult = yield tool.executer(input);
                    this.messageHistory.push({ role: 'developer', content: JSON.stringify({
                            functionName,
                            input,
                            toolResult
                        }) });
                }
            }
        });
    }
}
exports.Agent = Agent;
