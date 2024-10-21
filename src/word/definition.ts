import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs";
import { ChatCompletionMessageParam } from "openai/src/resources/index.js";
import { systemPrompt } from "./systemprompt"
import OpenAI from "openai";
import { Express } from "express";
import storage from "node-persist";
import { MD5 } from "bun";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_WORD_KEY,
  organization: process.env.OPENAI_ORGANIZATION ?? 'org-uktBsveUaXeMNXTgnjk5JlBA',
  project: process.env.OPENAI_WORD_PROJECT ?? 'proj_dQzJLf52B1TuvARWEGozTDyf',
});

let initialized = false;
export async function getDefinition(word: string,
  params: Partial<ChatCompletionCreateParamsBase> = {},
  version?: string
) {
  if (!initialized) {
    await storage.init();
    initialized = true;
  }
  const md5 = new MD5();
  md5.update(params?.model ?? "gpt-3.5-turbo");
  md5.update(params?.seed?.toString() ?? "0");
  md5.update(word);
  md5.update(version ?? "1");
  const tag = md5.digest("base64");

  const result = await storage.getItem(tag);
  if (result) {
    return {
      definition: result,
      cached: true,
    };
  }

  const systemText = systemPrompt;

  const message: ChatCompletionMessageParam = {
    "role": "user",
    "content": word,
  };

  const allMessages: ChatCompletionMessageParam[] = [
    {
      "role": "system",
      "content": systemText,
    },
    message,
  ];

  const response = await openai.chat.completions.create({
    messages: allMessages,
    model: params.model ?? "gpt-3.5-turbo",
    seed: params?.seed,
    temperature: params?.temperature ?? 1,
    max_tokens: params?.max_tokens ?? 256,
    top_p: params?.top_p ?? 1,
    frequency_penalty: params?.frequency_penalty ?? 0,
    presence_penalty: params?.presence_penalty ?? 0,
  }, {
  });

  const definition = response.choices[0].message.content;
  await storage.setItem(tag, definition);
  return { definition };
}

export function addWordRoutes(app: Express) {
  app.get("/definition/:word", async (req, res) => {
    const word = req.params.word;
    const version = req.query.version?.toString();
    try {
      const { definition, cached } = await getDefinition(word, {}, version);
      res.json({ word, definition, cached });
    } catch (error) {
      console.error('Error fetching definition:', error);
      res.status(500).json({ error: 'Failed to fetch definition' });
    }
  });
}
