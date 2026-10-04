import { HARNESS_PROMPT } from "./config";

export class AgentBuilder {
    public instructions: string | undefined;

    constructor() {}

    public setInstructions(instructions: string){
        this.instructions = instructions;
        return this;
    }
    public build() {
        return new Agent(this);
    }
}

export interface IMessage {
    role: 'system' | 'user' | 'developer' | 'assistant';
    content: string;
}

export class Agent {

    private instructions:string
    private messageHistory: IMessage[];

    constructor(builder: AgentBuilder) {
        this.instructions = `
        
        ${HARNESS_PROMPT}\n\n
        System Prompt: ${builder.instructions}

        `;
        this.messageHistory=[];
    }
    static builder(){
        return new AgentBuilder();
    }
    
    public run(input: string){
        console.log(`Running agent with input: ${input}`);
    }
}