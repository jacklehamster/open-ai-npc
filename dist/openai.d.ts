import { ChatCompletionCreateParamsBase, ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";
interface Props {
    model: ChatCompletionCreateParamsBase["model"];
    params?: Partial<ChatCompletionCreateParamsBase>;
    messages?: ChatCompletionMessageParam[];
    creature: string;
}
export declare function npc({ model, params, messages, creature, }: Props): Promise<any[]>;
export {};
