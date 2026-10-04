import { HARNESS_PROMPT } from "./config";

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
    constructor(builder: AgentBuilder) {
        this.toolMap = new Map();

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
        while(true){
            //... LLMResponse = call LLM(Message History + System Prompt);
            //Append LLMResponse to messageHistory
            // if LLMResponse.step === "OUTPUT" then break (Stop Condition)
            // if LLMResponse.step === "TOOL_REQUEST" 
            /*
            * tool = toolMap.find (LLMResponse.functionName)
            * toolResult = await tool.executer(LLMResponse.input)
            * Append toolResult to messageHistory
            * Continue loop
            */
        }
    }
}