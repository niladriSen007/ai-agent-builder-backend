import type { ChatRequest } from "../dto/request/ChatRequest.dto.js";

export class ChatService{
    constructor(){}

    async chat(req: ChatRequest){
        console.log("Hi")
    }
}