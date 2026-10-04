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
Object.defineProperty(exports, "__esModule", { value: true });
const agent_1 = require("./app/agent");
const weatherTool = {
    name: 'fetchWeatherInfo',
    description: 'Fetches current weather information for a given location.',
    doc: 'fetchWeatherInfo(location: string): Promise<string> - This function takes a location as input and returns a promise that resolves to the current weather information for that location.',
    executer: (input) => __awaiter(void 0, void 0, void 0, function* () {
        // Simulate an API call to fetch weather information
        return `The weather in ${input} is currently sunny.`;
    })
};
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const agent = agent_1.Agent.builder()
            .setInstructions(`You are an expert weather agent.`)
            .tool(weatherTool)
            .build();
        const result = yield agent.run('can you tell me the weather of Goa?');
        console.log(result);
    });
}
init();
