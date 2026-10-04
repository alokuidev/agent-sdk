import axios from 'axios';
import {Agent, AgentBuilder} from './app/agent';
import {ITool} from'./app/agent';
import {exec} from 'child_process';
import fs from 'fs/promises';
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
const cliAccessTool: ITool = {
    name: 'cliAccess',
    description: 'Executes a command in the command line interface (CLI) and returns the output.',
    doc: 'cliAccess(command: string): Promise<string> - This function takes a command as input, executes it in the CLI, and returns a promise that resolves to the output of the command.',
    executer: async (command: string) => {
        const hasRedirection = command.includes('>') && command.includes('.cpp');
        if (hasRedirection) {
            const quoteStart = command.indexOf("'");
            const quoteEnd = command.lastIndexOf("'");
            if (quoteStart !== -1 && quoteEnd > quoteStart) {
                const targetPath = command.slice(command.lastIndexOf('>') + 1).trim();
                const content = command.slice(quoteStart + 1, quoteEnd).replace(/\\n/g, '\n');
                await fs.writeFile(targetPath, content, 'utf8');
                return `Created ${targetPath}`;
            }
        }

        return new Promise((resolve, reject) => {
            const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';
            exec(command, { shell }, (error, stdout, stderr) => {
                if (error) {
                    reject(`Error executing command: ${error.message}\n${stderr || ''}`);
                    return;
                }
                resolve(stdout || stderr || 'Command executed successfully.');
            });
        });
    }
};
async function init(){
    const agent: Agent = Agent.builder()
    .setInstructions(`You are an expert weather agent.`)
    .tool(weatherTool)
    .tool(cliAccessTool)
    .build();
    agent.attachInterceptor(message => console.log(`Interceptor: ${message.role} - ${message.content}`));
    const result = await agent.run('can you  build a simple hello world program in c++ on my current project as hello.cpp');
    console.log(result![result?.length! - 1]);
}

init();