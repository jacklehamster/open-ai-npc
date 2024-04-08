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

app.use('/example', express.static(path.join(import.meta.dir, '../example')))

app.get("/api", async (req, res) => {
  const query = req.query as Query;
  let choice = (query.choice ?? "") as string;
  const response = await fetchChoice(choice, query.model ?? undefined, query.creature ?? undefined);
  return res.json(response);
});

app.get("/index.html", async (req, res) => {
  return res.sendFile(path.join(import.meta.dir, "../index.html"));
});

app.get("/", (req, res) => {
  res.send(`
  <body>
  <h1>NPC Dialog Generator using OpenAI</h1>
  <h4><b>Author:</b> <a href="https://github.com/jacklehamster">jacklehamster</a></h4>
  <hr>
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
  <div>
    Source on Github:
    <a href="https://github.com/jacklehamster/open-ai-npc?tab=readme-ov-file#open-ai-npc">https://github.com/jacklehamster/open-ai-npc</a>
  </div>

  <div style="margin: 20px">
    <iframe width="560" height="315" src="https://www.youtube.com/embed/SGSDGGPVYyw?si=i0zIqUgfdU5U5Vt5" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
  </div>

  </body>
  `);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

export { npc, fetchChoice };
export type { NpcModel };
