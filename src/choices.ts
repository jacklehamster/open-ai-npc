import storage from "node-persist";
import { npc } from "./openai";

let initialized: boolean;

export async function fetchChoice(choice: string,
  model: string = "gpt-3.5-turbo-1106",
  creature: string = "an angel with wings") {
  const tag = `${model}-${creature}-path-`;
  if (!initialized) {
    await storage.init();
    initialized = true;
  }
  const savedChoice = await storage.getItem(tag + choice);
  if (savedChoice) {
    return [savedChoice[savedChoice.length - 1].content];
  }


  const path = !choice.length ? [] : choice.split("|");
  console.log("??", path);
  let messages: any[] = [];// = ctx.query.get("message");
  if (!messages.length) {
    if (path.length) {
      let preData = await storage.getItem(tag + path.slice(0, path.length - 1).join("|"));
      if (!preData) {
        await fetchChoice(path.slice(0, path.length - 1).join("|"));
        preData = await storage.getItem(tag + path.slice(0, path.length - 1).join("|"));
        if (!preData) {
          throw new Error("Error?");
        }
      }

      choice = path[path.length - 1];
      if (preData) {
        messages = preData;
        messages.push({
          role: "user",
          content: choice ?? "",
        });
      }
    }
  }

  console.log(">>>", messages);

  const response = await npc({
    model,
    creature,
    messages: messages.map((m: any, index: number) => {
      if (m.role === "user" && typeof (m.content) === "string") {
        const previousMessage = messages[index - 1];
        if (previousMessage) {
          if (previousMessage.role === "assistant" && previousMessage.content.player[m.content.toUpperCase()]) {
            return {
              ...m,
              content: previousMessage.content.player[m.content.toUpperCase()],
            };
          }
        }
      }

      return {
        ...m,
        content: typeof (m.content) === "string" ? "talk about " + m.content : JSON.stringify(m.content),
      };
    }),
  });
  await storage.setItem(tag + (path.join("|") ?? ""), messages.concat(response.map(content => ({
    role: "assistant",
    content: content,
  }))));
  return response;
}
