import type { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs";
import type { ChatCompletionMessageParam } from "openai/src/resources/index.js";
import { systemPrompt } from "./systemprompt"
import OpenAI from "openai";
import type { Express } from "express";
import storage from "node-persist";
import { MD5 } from "bun";


export class DefinitionManager {
  openai: OpenAI;
  constructor(clientOptions = {
    apiKey: process.env.OPENAI_WORD_KEY,
    organization: process.env.OPENAI_ORGANIZATION,
    project: process.env.OPENAI_WORD_PROJECT,
  }) {
    this.openai = new OpenAI(clientOptions);
  }

  initialized = false;
  async getDefinition(word: string,
    params: Partial<ChatCompletionCreateParamsBase> = {},
    version?: string
  ) {
    if (!this.initialized) {
      await storage.init();
      this.initialized = true;
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

    let w = word;
    if (!isNaN(parseFloat(word))) {
      const n = parseFloat(word);
      w = this.decodeWord(n);
    }


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

    const definition = response.choices[0].message.content;
    await storage.setItem(tag, definition);
    return { definition };
  }

  addWordRoutes(app: Express) {
    app.get("/definition/:word", async (req, res) => {
      const word = req.params.word;
      const version = req.query.version?.toString();
      try {
        const { definition, cached } = await this.getDefinition(word, {}, version);
        res.json({ word, definition, cached });
      } catch (error) {
        console.error('Error fetching definition:', error);
        res.status(500).json({ error: 'Failed to fetch definition' });
      }
    });

    app.get("/decode_word/:code", async (req, res) => {
      const code = parseInt(req.params.code);
      if (isNaN(code)) {
        res.json({ code: this.encodeWord(req.params.code), word: req.params.code });
      } else {
        res.json({ code, word: this.decodeWord(code) });
      }
    });
  }

  decodeWord(code: number) {
    let word = "";
    for (let i = 0; i < 5; i++) {
      const letterIndex = code % 27;
      code = Math.floor(code / 27);
      const letter = String.fromCharCode(letterIndex + "a".charCodeAt(0) - 1);
      word = letter + word;
      if (!code) {
        break;
      }
    }
    return word;
  }

  encodeWord(word: string) {
    let code = 0;
    for (let i = 0; i < word.length; i++) {
      const letterIndex = word.charCodeAt(i) - "a".charCodeAt(0) + 1;
      code = code * 27 + letterIndex;
    }
    return code;
  }
}
