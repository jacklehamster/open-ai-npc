import OpenAI from "openai";
import { ChatCompletionCreateParamsBase, ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";
import { systemPrompt } from "./systemprompt";

interface Props {
  model: ChatCompletionCreateParamsBase["model"];
  params?: Partial<ChatCompletionCreateParamsBase>;
  messages?: ChatCompletionMessageParam[];
  creature: string;
}

export async function npc({
  model,
  params = {
    seed: 0,
  },
  messages = [],
  creature,
}: Props) {
  const systemText = systemPrompt;//fs.readFileSync(`${import.meta.dir}/system.txt`, "utf-8");

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const allMessages: ChatCompletionMessageParam[] = [
    {
      "role": "system",
      "content": systemText,
    },
    {
      "role": "user",
      "content": "You are " + creature,
    },
    // {
    //   "role": "assistant",
    //   "content": "{\n    \"creature\": \"A majestic angel with shimmering wings stands before you.\",\n    \"player\": {\n        \"A\": \"Greetings, divine creature.\",\n        \"B\": \"Your wings are truly beautiful.\",\n        \"C\": \"I'm not impressed by your appearance.\",\n        \"D\": \"I must be on my way.\"\n    },\n    \"attributes\": {\n        \"anger\": 1,\n        \"seduced\": 0,\n        \"trust\": 0,\n        \"fear\": 1\n    },\n    \"actions\": {\n        \"fight\": false,\n        \"run away\": false,\n        \"trade\": false,\n        \"join party\": false\n    },\n    \"info\": {\n        \"name\": null\n    }\n}"
    // },
    // {
    //   "role": "user",
    //   "content": "Greetings, divine creature."
    // },
    // {
    //   "role": "assistant",
    //   "content": "{\n    \"creature\": \"Hello, traveler. What brings you to these hallowed halls?\",\n    \"player\": {\n        \"A\": \"I seek your wisdom and guidance.\",\n        \"B\": \"I am in awe of your presence.\",\n        \"C\": \"I don't believe in angels like you.\",\n        \"D\": \"I bid you farewell.\"\n    },\n    \"attributes\": {\n        \"anger\": 0,\n        \"seduced\": 0,\n        \"trust\": 1,\n        \"fear\": 1\n    },\n    \"actions\": {\n        \"fight\": false,\n        \"run away\": false,\n        \"trade\": false,\n        \"join party\": false\n    },\n    \"info\": {\n        \"name\": null\n    }\n}"
    // },
    // {
    //   "role": "user",
    //   "content": "What is your name?"
    // },

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
    response_format: { type: "json_object" },
  }, {
  });

  return response.choices.map(choice => JSON.parse(choice.message.content ?? "{}"));
}
