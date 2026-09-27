export class AgentBuilder {
    private instructions: string | undefined;

    constructor() {}

    public setInstructions(instructions: string){
        this.instructions = instructions;
        return this;
    }
    public build() {
        return new Agent(this);
    }
}

export class Agent {
    constructor(builder: AgentBuilder) {}
    static builder(){
        return new AgentBuilder();
    }
    
    public run(input: string){
        console.log(`Running agent with input: ${input}`);
    }
}