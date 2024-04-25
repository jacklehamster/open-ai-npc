import { MD5 } from "bun";
import storage from "node-persist";
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs";
import { ChatCompletionMessageParam } from "openai/src/resources/index.js";
import { systemPrompt } from "./systemprompt";
import OpenAI from "openai";

let initialized = false;
export async function makeComment(situations: string[],
  model: string = "gpt-3.5-turbo-1106",
  seed?: string,
  dictionary?: Record<string, string>,
) {
  const sit = situations.map(s => s.trim())
    .map(s => dictionary ? dictionary[s] ?? "" : s);
  const md5 = new MD5();
  md5.update(model);
  md5.update(seed ?? "0");
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
  if (dictionary) {
    const md5 = new MD5();
    const entries = Object.entries(dictionary);
    entries.sort((a, b) => a.join("-").localeCompare(b.join("-")));
    entries.forEach(e => {
      md5.update(e[0]);
      md5.update(e[1]);
    });
    const tag = md5.digest("base64");
    console.log("CHECK TAG:", tag);
    //  check against list of authorized tags before calling OpenAI
  }




  const response = await comment({
    model,
    messages: sit.map((situation) => {
      return {
        role: 'user',
        content: situation,
      };
    }),
    params: {
      seed: parseInt(seed ?? "0"),
    }
  });
  const content = response.choices[0].message.content;
  await storage.setItem(tag, content);
  console.log(content);
  return content;
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
