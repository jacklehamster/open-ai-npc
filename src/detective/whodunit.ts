import type { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs";
import type { ChatCompletionMessageParam } from "openai/src/resources/index.js";
import { STORY, systemPrompt } from "./systemprompt"
import OpenAI from "openai";
import type { Express } from "express";


export class DetectiveManager {
  openai: OpenAI;
  constructor(clientOptions = {
    apiKey: process.env.OPENAI_LANG_KEY,
    organization: process.env.OPENAI_ORGANIZATION,
    project: process.env.OPENAI_LANG_PROJECT,
  }) {
    this.openai = new OpenAI(clientOptions);
  }

  initialized = false;
  async answer(sentence: string,
    previous: string | undefined,
    params: Partial<ChatCompletionCreateParamsBase> = {},
  ) {

    let w = sentence;

    const message: ChatCompletionMessageParam = {
      "role": "user",
      "content": w,
    };

    const allMessages: ChatCompletionMessageParam[] = [
      {
        "role": "system",
        "content": STORY[0],
      },
      {
        "role": "system",
        "content": systemPrompt,
      },
      {
        "role": "assistant",
        "content": previous ? `For context, the previous response from the GAME MASTER was:\n${previous}` : "",
      },
      message,
    ];

    const response = await this.openai.chat.completions.create({
      messages: allMessages,
      model: params.model ?? "gpt-4-turbo",
      seed: params?.seed,
      temperature: params?.temperature ?? 1,
      max_tokens: params?.max_tokens ?? 256,
      top_p: params?.top_p ?? 1,
      frequency_penalty: params?.frequency_penalty ?? 0,
      presence_penalty: params?.presence_penalty ?? 0,
    }, {
    });

    const content = response.choices[0].message.content;
    console.log(content);
    return { content };
  }

  addDetective(app: Express) {
    app.get("/detective/:sentence", async (req, res) => {
      const sentence = req.params.sentence?.toString();
      const previous = req.query.previousAnswer?.toString();
      const model = req.query.model?.toString();
      try {
        const { content } = await this.answer(sentence, previous, {
          model,
        });
        res.json({ content });
      } catch (error) {
        console.error('Error fetching definition:', error);
        res.status(500).json({ error: 'Failed to fetch definition' });
      }
    });
  }
}
