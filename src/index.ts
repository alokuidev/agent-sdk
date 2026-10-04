import axios from 'axios';
import {Agent, AgentBuilder} from './app/agent';
import {ITool} from'./app/agent';

const weatherTool: ITool = {
    name:'fetchWeatherInfo',
    description:'Fetches current weather information for a given location.',
    doc:'fetchWeatherInfo(location: string): Promise<string> - This function takes a location as input and returns a promise that resolves to the current weather information for that location.',
    executer: async (cityName: string) => {
        const sanitizedCity = cityName.trim();
        const url = `https://wttr.in/${encodeURIComponent(sanitizedCity)}?format=3`;
        const response = await axios.get(url, { responseType: 'text' });
        return JSON.stringify({ cityName: sanitizedCity, weather: response.data });
    }
};

async function init(){
    const agent: Agent = Agent.builder()
    .setInstructions(`You are an expert weather agent.`)
    .tool(weatherTool)
    .build();
    const result = await agent.run('can you tell me the weather of Goa and Mumbai?');
    console.log(result);
}

init();