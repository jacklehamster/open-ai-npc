import storage from "node-persist";
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs";
import { ChatCompletionMessageParam, ChatModel } from "openai/resources/index.mjs";
import { systemPrompt } from "./systemprompt";
import { openai } from "./openai/openai";
import { CHAT_MODEL } from "@/config";

const AUTHORIZED_DICO = new Set<string>([
]);

let initialized = false;
export async function makeComment(situations: string[],
  model: ChatModel = CHAT_MODEL,
  seed?: string,
  dictionary?: Record<string, string>,
  authorizationCode?: string,
  customFields?: Record<string, {
    type?: string;
    value: string | number | boolean;
  }>,
) {
  const sit = situations.map(s => s.trim())
    .map(s => dictionary ? dictionary[s] ?? "" : s)
    .map(s => {
      if (!customFields) {
        return s;
      }
      Object.entries(customFields).forEach(([key, field]) => {
        s = s.replaceAll(`<${key}>`, field.value.toString());
      });
      return s;
    });
  const md5 = new Bun.CryptoHasher("md5");
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
    return {
      response: result,
      cached: true,
    };
  }
  let dictionaryTag;
  let authorized = false;
  if (dictionary) {
    const md5 = new Bun.CryptoHasher("md5");
    const entries = Object.entries(dictionary);
    entries.sort((a, b) => a.join("-").localeCompare(b.join("-")));
    entries.forEach(e => {
      md5.update(e[0]);
      md5.update(e[1]);
    });
    dictionaryTag = md5.digest("base64");
    //  check against list of authorized tags before calling OpenAI
    authorized = AUTHORIZED_DICO.has(dictionaryTag);
    if (!authorized && authorizationCode) {
      const md5 = new Bun.CryptoHasher("md5");
      const md5auth = md5.update(dictionaryTag + "🌶️ pepper").digest("base64");
      authorized = authorizationCode === md5auth;
      console.log("authorizationCode", md5auth);
    }
  }


  const res = await comment({
    model: openai.baseURL === "https://api.deepseek.com" ? "deepseek-chat" : model,
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
  const response = res.choices[0].message.content;
  await storage.setItem(tag, response);
  return {
    model: res.model,
    response,
    dictionaryTag,
    authorized,
    ...(dictionary ? { situations } : {}),
  };
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

  const allMessages: ChatCompletionMessageParam[] = [
    {
      "role": "system",
      "content": systemText,
    },
    ...messages,
  ];

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
