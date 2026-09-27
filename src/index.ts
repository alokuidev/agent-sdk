import {Agent, AgentBuilder} from './app/agent';

async function init(){
    const agent: Agent = Agent.builder().setInstructions(`You are an expert mathematician. You will answer questions about mathematics.`).build();
    agent.run(`What is the integral of x^2?`);
}

init();