import Bao from "baojs";
import serveStatic from "serve-static-bun";
import storage from "node-persist";
import { fetchChoice } from "./choices";
import { npc } from "./openai";

const app = new Bao();

app.get("/api", async (ctx) => {
  let choice = ctx.query.get("choice") ?? "";
  const response = await fetchChoice(choice, ctx.query.get("model") ?? undefined, ctx.query.get("creature") ?? undefined);
  return ctx.sendPrettyJson(response);
});

app.get("/", async (ctx) => {
  return ctx.sendText(`
    To use this API, first call: "/api", then provide the following query parameters:
    - choice [optional]: Choices separated by "|". Ex: choice=A|B|A|C (note that you must include previous choices to continue a conversation). You can also insert custom choices like choice=pizza|A
    - model [optional]: The chatgpt model to use. Default is "gpt-3.5-turbo-1106". List at: https://platform.openai.com/docs/models
    - creature [optional]: A description of the creature. Default is "an angel with wings".
  `)
});

//app.get("/*any", serveStatic("/", { middlewareMode: "bao" }));

//  Call NPC
// const response = await npc();
// console.log(response);

const server = app.listen({ port: parseInt(process.env.PORT) || 3000 });


console.log(`Listening on http://localhost:${server.port}`);

export { npc, fetchChoice };
