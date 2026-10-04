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
const axios_1 = __importDefault(require("axios"));
const agent_1 = require("./app/agent");
const child_process_1 = require("child_process");
const promises_1 = __importDefault(require("fs/promises"));
const weatherTool = {
    name: 'fetchWeatherInfo',
    description: 'Fetches current weather information for a given location.',
    doc: 'fetchWeatherInfo(location: string): Promise<string> - This function takes a location as input and returns a promise that resolves to the current weather information for that location.',
    executer: (cityName) => __awaiter(void 0, void 0, void 0, function* () {
        const sanitizedCity = cityName.trim();
        const url = `https://wttr.in/${encodeURIComponent(sanitizedCity)}?format=3`;
        const response = yield axios_1.default.get(url, { responseType: 'text' });
        return JSON.stringify({ cityName: sanitizedCity, weather: response.data });
    })
};
const cliAccessTool = {
    name: 'cliAccess',
    description: 'Executes a command in the command line interface (CLI) and returns the output.',
    doc: 'cliAccess(command: string): Promise<string> - This function takes a command as input, executes it in the CLI, and returns a promise that resolves to the output of the command.',
    executer: (command) => __awaiter(void 0, void 0, void 0, function* () {
        const hasRedirection = command.includes('>') && command.includes('.cpp');
        if (hasRedirection) {
            const quoteStart = command.indexOf("'");
            const quoteEnd = command.lastIndexOf("'");
            if (quoteStart !== -1 && quoteEnd > quoteStart) {
                const targetPath = command.slice(command.lastIndexOf('>') + 1).trim();
                const content = command.slice(quoteStart + 1, quoteEnd).replace(/\\n/g, '\n');
                yield promises_1.default.writeFile(targetPath, content, 'utf8');
                return `Created ${targetPath}`;
            }
        }
        return new Promise((resolve, reject) => {
            const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';
            (0, child_process_1.exec)(command, { shell }, (error, stdout, stderr) => {
                if (error) {
                    reject(`Error executing command: ${error.message}\n${stderr || ''}`);
                    return;
                }
                resolve(stdout || stderr || 'Command executed successfully.');
            });
        });
    })
};
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const agent = agent_1.Agent.builder()
            .setInstructions(`You are an expert weather agent.`)
            .tool(weatherTool)
            .tool(cliAccessTool)
            .build();
        agent.attachInterceptor(message => console.log(`Interceptor: ${message.role} - ${message.content}`));
        const result = yield agent.run('can you  build a simple hello world program in c++ on my current project as hello.cpp');
        console.log(result[(result === null || result === void 0 ? void 0 : result.length) - 1]);
    });
}
init();
