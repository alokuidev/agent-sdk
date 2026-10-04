import {Agent, AgentBuilder} from './app/agent';
import {ITool} from'./app/agent';

const weatherTool: ITool = {
    name:'fetchWeatherInfo',
    description:'Fetches current weather information for a given location.',
    doc:'fetchWeatherInfo(location: string): Promise<string> - This function takes a location as input and returns a promise that resolves to the current weather information for that location.',
    executer: async (input: string) => {
        // Simulate an API call to fetch weather information
        return `The weather in ${input} is currently sunny.`;
    }
};

async function init(){
    const agent: Agent = Agent.builder()
    .setInstructions(`You are an expert mathematician. You will answer questions about mathematics.`)
    .tool(weatherTool)
    .build();
    agent.printSystemPrompt();
}

init();