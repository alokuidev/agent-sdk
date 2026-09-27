export class AgentBuilder {
    private instructions: string | undefined;

    constructor() {}

    public setInstructions(instructions: string){
        this.instructions = instructions;
    }
}

export class Agent {
    static builder(){
        return new AgentBuilder();
    } 
}