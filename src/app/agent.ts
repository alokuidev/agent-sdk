import "dotenv/config";
import { HARNESS_PROMPT } from "./config";
import OpenAI from "openai";
export interface IMessage {
    role: 'system' | 'user' | 'developer' | 'assistant';
    content: string;
}

export interface ITool{
    name: string;
    description: string;
    doc?: string;
    executer:(input: string) => Promise<string>;
}

export class AgentBuilder {
    public instructions: string | undefined;
    public toolList: ITool[] | undefined;
    constructor() {
        this.toolList = [];
    }

    public setInstructions(instructions: string){
        this.instructions = instructions;
        return this;
    }

    public tool(t: ITool){
        this.toolList?.push(t);
        return this;
    }


    public build() {
        return new Agent(this);
    }
}



export class Agent {

    private instructions:string
    private messageHistory: IMessage[];
    private toolMap: Map<string, ITool>;
    private openai: OpenAI;

    private MAX_LOOP = 30;
    constructor(builder: AgentBuilder) {
        this.toolMap = new Map();
        const apiKey = process.env.OPENAI_API_KEY || "";
        this.openai = new OpenAI({ apiKey });
        for(const t of builder.toolList || []) {
            this.toolMap.set(t.name, t);
        }
        this.instructions = `
        
        ${HARNESS_PROMPT}\n\n
        System Prompt: ${builder.instructions}

        Available Tools:
        ${builder.toolList?.map(t => JSON.stringify({functionName: t.name, functionDescription: t.description, functionDoc: t.doc})).join('\n')}
        `;
        this.messageHistory=[];
    }
    static builder(){
        return new AgentBuilder();
    }
    
    public printSystemPrompt(){
        console.log(this.instructions);
    }


    public async run(input: string){
        this.messageHistory.push({role:'user', content: input});
        for(let i = 0; i < this.MAX_LOOP; i++){
            //... LLMResponse = call LLM(Message History + System Prompt);
            const llmResponse = await this.openai.chat.completions.create({
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

            const rawLLMResponse: string = llmResponse.choices[0].message?.content as string;
            //Append LLMResponse to messageHistory
            this.messageHistory.push({role:'assistant', content: rawLLMResponse});
            //prase LLMResponse to JSON
            const  parsedResult = JSON.parse(rawLLMResponse);
            // if LLMResponse.step === "OUTPUT" then break (Stop Condition)
            if(parsedResult.step.toLowerCase() === "output") return this.messageHistory;
            // if LLMResponse.step === "TOOL_REQUEST" 
            /*
            * tool = toolMap.find (LLMResponse.functionName)
            * toolResult = await tool.executer(LLMResponse.input)
            * Append toolResult to messageHistory
            * Continue loop
            */
            if(parsedResult.step.toLowerCase() === "tool_request"){
                const {functionName, input} = parsedResult;
                const tool = this.toolMap.get(functionName);
                if(!tool) throw new Error(`Tool ${functionName} not found`);
                const toolResult = await tool.executer(input);
                this.messageHistory.push({role:'developer', content: JSON.stringify({
                    functionName,
                    input,
                    toolResult
                })});
            }
        }
    }
}