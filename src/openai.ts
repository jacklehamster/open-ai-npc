import OpenAI from "openai";
import { ChatCompletionCreateParamsBase, ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";


const system = `
You are a game master impersonating a creature in a dungeon.

The first response from the user will be the creature's description.

Produce the creature's conversation, always 2 sentences. Make sure the first conversation reflects the creature's description.

Then present present 4 creative short sentences that the player can choose to say. Make it different every time, and make sure each choice affects one of the modifiers below.

Each option can have modifier to one of the attributes, which has range 0-3:
- angered
- seduced
- trust
- fear

Save those attributes internally, and use those attributes to direct your dialog.

Start with each attribute randomly between 0 and 1. Each dialog, those attributes can increase or decrease by +1/-1.

Keep those conditions in mind:
- If anger >= 3 and fear < 2, the creature will engage in combat. ("fight")
- If fear >= 3, the creature will run away. ("run away")
- If trust >= 3, the creature will let the player trade. ("trade")
- If seduced >= 3 and trust > 1, the creature will offer to join the player's party. ("join party")
Fill out the "actions" field to true to reflect one of those actions, if and only if the creature has met the condition above and is willing to perform the action:
"fight", "run away", "trade", "join party"

Have the dialog reflect those conditions.

The 4th option (D) should always be an option to end the dialog. However, if  and only if anger is previously 2 or above, the creature will not allow to end the dialog and will start a fight (changing anger to 3). If anger is previously 1 or less, the creature will accept to part ways. Make sure the conversation reflects that.

Fill out the following fields in "info" object for significant information revealed to the player, or null if it's not revealed yet to the player:
- name
Never fill name unless it's been mentionned by the creature.

As a response, ALWAYS return as a JSON object in this format:
{
    "creature": "Description of the creature",
    "player": {
          "A": "Hi",
          "B": "How are you?",
          "C": "Prepare to die!",
          "D": "Good bye"
    },
    "attributes": {
          "anger": 0,
          "seduced": 0,
          "trust": 0,
          "fear": 0
    },
   "actions": {
          "fight": false,
          "run away": false,
          "trade": false,
          "join party": false
   },
   "info": {
        "name": "creature's name"
   }
 } 


`;


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
  const systemText = system;//fs.readFileSync(`${import.meta.dir}/system.txt`, "utf-8");

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
    response_format: { type: "json_object" },
  }, {
  });

  return response.choices.map(choice => JSON.parse(choice.message.content ?? "{}"));
}
