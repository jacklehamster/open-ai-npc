import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs";
import { ChatCompletionMessageParam } from "openai/src/resources/index.js";
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
export async function getMessage(
  systemText: string,
  prompt: string,
  params: Partial<ChatCompletionCreateParamsBase> = {},
  version?: string
) {
  if (!initialized) {
    await storage.init();
    initialized = true;
  }
  const md5 = new MD5();
  md5.update(params?.model || "gpt-3.5-turbo");
  md5.update(params?.seed?.toString() ?? "0");
  md5.update(systemText);
  md5.update(prompt);
  md5.update(version ?? "1");
  const tag = md5.digest("base64");

  const result = await storage.getItem(tag);
  if (result) {
    return {
      content: result,
      cached: true,
    };
  }

  const allMessages: ChatCompletionMessageParam[] = [
    {
      "role": "system",
      "content": systemText,
    },
    {
      "role": "user",
      "content": prompt,
    }
  ];

  const response = await openai.chat.completions.create({
    messages: allMessages,
    model: params.model || "gpt-3.5-turbo",
    seed: params?.seed,
    temperature: params?.temperature ?? 1,
    max_tokens: params?.max_tokens ?? 256,
    top_p: params?.top_p ?? 1,
    frequency_penalty: params?.frequency_penalty ?? 0,
    presence_penalty: params?.presence_penalty ?? 0,
  }, {
  });

  const content = response.choices[0].message.content;
  await storage.setItem(tag, content);
  return { content };
}

export function addCustomRoute(app: Express) {
  app.get("/custom", async (req, res) => {
    const systemPrompt = decodeURIComponent(`${req.query.systemPrompt}`);
    const prompt = decodeURIComponent(`${req.query.prompt}`);
    const version = req.query.version?.toString();
    try {
      const { content, cached } = await getMessage(systemPrompt, prompt, {
        ...req.query,
      }, version);
      res.json({ content, cached });
    } catch (error) {
      console.error('Error fetching definition:', error);
      res.status(500).json({ error: 'Failed to fetch definition' });
    }
  });

  app.set('view engine', 'ejs');

  app.get('/prompt', async (req, res) => {
    const systemPrompt = req.query.systemPrompt?.toString() ?? "";
    const prompt = req.query.prompt?.toString() ?? "";
    const model = req.query.model?.toString();
    const message = await getMessage(systemPrompt, prompt, { model });
    const url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);

    const data = {
      title: 'Custom prompt',
      systemPrompt,
      prompt,
      model,
      content: message.content,
      url,
    };
    res.render('custom', data);
  });
}
