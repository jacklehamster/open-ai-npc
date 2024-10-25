import OpenAI from "openai";
import fs from "fs"
import "dotenv/config";

const systemText = fs.readFileSync(`${import.meta.dir}/system.txt`, "utf-8");

const model = "gpt-3.5-turbo-1106";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_TROLL_KEY,
  organization: process.env.OPENAI_ORGANIZATION ?? 'org-uktBsveUaXeMNXTgnjk5JlBA',
  project: process.env.OPENAI_TROLL_PROJECT ?? 'proj_14nsI578VavWlr7T8forl9jv',
});

const response = await openai.chat.completions.create({
  model,
  messages: [
    {
      "role": "system",
      "content": systemText,
    },
    {
      "role": "assistant",
      "content": "{\n    \"creature\": \"Greetings, mortal.\",\n    \"player\": {\n          \"A\": \"Hello, what are you doing here?\",\n          \"B\": \"You look powerful, can you help me?\",\n          \"C\": \"I'll defeat you easily!\",\n          \"D\": \"I'll leave you be.\"\n    },\n    \"attributes\": {\n          \"anger\": 0,\n          \"seduced\": 1,\n          \"trust\": 0,\n          \"fear\": 1\n    }\n}"
    },
    {
      "role": "user",
      "content": "a"
    },
    {
      "role": "assistant",
      "content": "{\n    \"creature\": \"I am lurking in the shadows.\",\n    \"player\": {\n          \"A\": \"Why are you hiding?\",\n          \"B\": \"I mean no harm, can we talk?\",\n          \"C\": \"Show yourself, coward!\",\n          \"D\": \"I'll be on my way.\"\n    },\n    \"attributes\": {\n          \"anger\": 1,\n          \"seduced\": 0,\n          \"trust\": 1,\n          \"fear\": 2\n    }\n} "
    },
    {
      "role": "user",
      "content": "c"
    },
    {
      role: "assistant",
      content: "{\n    \"creature\": \"You dare challenge me?\",\n    \"player\": {\n          \"A\": \"I was just testing your strength.\",\n          \"B\": \"My apologies, I didn't mean it.\",\n          \"C\": \"Come on then, let's fight!\",\n          \"D\": \"I'll take my leave now.\"\n    },\n    \"attributes\": {\n          \"anger\": 2,\n          \"seduced\": 0,\n          \"trust\": 1,\n          \"fear\": 2\n    }\n} ",
    },
    {
      role: "user",
      content: "b"
    }
  ],
  temperature: 1,
  max_tokens: 256,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
}, {
});

console.info(response, JSON.parse(response.choices[0].message.content ?? "{}"));
