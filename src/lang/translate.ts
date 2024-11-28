import type { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs";
import type { ChatCompletionMessageParam } from "openai/src/resources/index.js";
import { systemPrompt } from "./systemprompt"
import OpenAI from "openai";
import type { Express } from "express";
import storage from "node-persist";
import { MD5 } from "bun";


export class TranslateManager {
  openai: OpenAI;
  constructor(clientOptions = {
    apiKey: process.env.OPENAI_LANG_KEY,
    organization: process.env.OPENAI_ORGANIZATION,
    project: process.env.OPENAI_LANG_PROJECT,
  }) {
    this.openai = new OpenAI(clientOptions);
  }

  initialized = false;
  async getTranslation(sentence: string,
    lang: string,
    params: Partial<ChatCompletionCreateParamsBase> = {},
    version?: string
  ) {
    if (!this.initialized) {
      await storage.init();
      this.initialized = true;
    }
    const md5 = new MD5();
    md5.update("translate");
    md5.update(params?.model ?? "gpt-3.5-turbo");
    md5.update(params?.seed?.toString() ?? "0");
    md5.update(systemPrompt);
    md5.update(sentence);
    md5.update(lang);
    md5.update(version ?? "1");
    const tag = md5.digest("base64");

    const result = await storage.getItem(tag);
    if (result) {
      return {
        translation: result,
        cached: true,
      };
    }

    const systemText = systemPrompt.replaceAll("$lang", lang);

    let w = sentence;

    const message: ChatCompletionMessageParam = {
      "role": "user",
      "content": w,
    };

    const allMessages: ChatCompletionMessageParam[] = [
      {
        "role": "system",
        "content": systemText,
      },
      message,
    ];

    const response = await this.openai.chat.completions.create({
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

    const translation = response.choices[0].message.content;
    await storage.setItem(tag, translation);
    return { translation };
  }

  addTranslateRoutes(app: Express) {
    app.get("/translate/:sentence", async (req, res) => {
      const sentence = req.params.sentence?.toString();
      const version = req.query.version?.toString();
      const lang = req.query.lang?.toString() ?? "en-US";
      try {
        const { translation, cached } = await this.getTranslation(sentence, lang, {}, version);
        res.json({ sentence, translation, cached });
      } catch (error) {
        console.error('Error fetching definition:', error);
        res.status(500).json({ error: 'Failed to fetch definition' });
      }
    });
  }
}
