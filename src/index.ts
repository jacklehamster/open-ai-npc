import { fetchChoice } from "./choices";
import { npc } from "./openai";
import express from "express";
import path from "path";
import { NpcModel } from "./model/NpcModel";

const app = express();
const port = parseInt(process.env.PORT ?? "3000");

interface Query {
  choice?: string;
  model?: string;
  creature?: string;
}

app.use(express.static('../example'));
app.use('/example', express.static(path.join(import.meta.dir, '../example')))

app.get("/api", async (req, res) => {
  const query = req.query as Query;
  let choice = (query.choice ?? "") as string;
  const response = await fetchChoice(choice, query.model ?? undefined, query.creature ?? undefined);
  return res.json(response);
});

app.get("/", (req, res) => {
  res.send(`
  <div style="white-space: pre">
  To use this API, first call: "/api", then provide the following query parameters:
  - choice [optional]: Choices separated by "|". Ex: choice=A|B|A|C
    (note that you must include previous choices to continue a conversation).
    You can also insert custom choices like choice=pizza|A
  - model [optional]: The chatgpt model to use. Default is "gpt-3.5-turbo-1106".
    List at: https://platform.openai.com/docs/models
  - creature [optional]: A description of the creature. Default is "an angel with wings".
  </div>
  <div>
    You can check out the NPC dialog demo, which uses this API. Click here:
    <br>
    <h2>
      <a href="/example">NPC Dialog Demo</a>
    </h2>
  </div>
  `);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

export { npc, fetchChoice };
export type { NpcModel };
