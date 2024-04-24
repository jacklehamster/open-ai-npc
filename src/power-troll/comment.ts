import { MD5 } from "bun";
import storage from "node-persist";
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs";
import { ChatCompletionMessageParam } from "openai/src/resources/index.js";
import { systemPrompt } from "./systemprompt";
import OpenAI from "openai";

let initialized = false;
export async function makeComment(situations: string[],
  model: string = "gpt-3.5-turbo-1106"
) {
  const sit = situations.map(s => s.trim());
  const md5 = new MD5();
  sit.forEach(s => md5.update(s));
  const tag = md5.digest("base64");
  if (!initialized) {
    await storage.init();
    initialized = true;
  }
  const result = await storage.getItem(tag);
  if (result) {
    return result;
  }

  const response = await comment({
    model,
    messages: sit.map((situation) => {
      return {
        name: undefined,
        role: 'user',
        content: situation,
      };
    }),
  });
  await storage.setItem(tag, response.choices[0]);
  return response;
}



interface Props {
  model: ChatCompletionCreateParamsBase["model"];
  params?: Partial<ChatCompletionCreateParamsBase>;
  messages?: ChatCompletionMessageParam[];
}

export async function comment({
  model,
  params = {
    seed: 0,
  },
  messages = []
}: Props) {
  const systemText = systemPrompt;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const allMessages: ChatCompletionMessageParam[] = [
    {
      "role": "system",
      "content": systemText,
    },
    ...messages,
  ];
  console.log(allMessages);

  const response = await openai.chat.completions.create({
    model,
    messages: allMessages,
    seed: params?.seed,
    temperature: params?.temperature ?? 1,
    max_tokens: params?.max_tokens ?? 256,
    top_p: params?.top_p ?? 1,
    frequency_penalty: params?.frequency_penalty ?? 0,
    presence_penalty: params?.presence_penalty ?? 0,
  }, {
  });

  return response;
}
