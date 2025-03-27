import { fetchChoice } from "./choices";
import { npc } from "./openai";
import path from "path";
import { NpcModel } from "./model/NpcModel";
import { makeComment } from "./power-troll/comment";
import http from 'http';
import { addRoutes } from "dok-db-manager";
import express from "express";
import { addCustomRoute } from "./custom/custom";
import { DefinitionManager } from "./word/definition";
import { moderator } from "./power-troll/moderator";
import { TranslateManager } from "./lang/translate";
import { DetectiveManager } from "./detective/whodunit";
import { attachSyncSocket } from "@dobuki/syncopath";
import { WebSocketServer } from "ws";
import { ChatModel } from "openai/resources/index.mjs";

const app = express();

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', "true");
  next();
});

const port = parseInt(process.env.PORT ?? "4000");

interface Query {
  choice?: string;
  model?: string;
  creature?: string;
  jsonp?: string;
}

app.use('/example', express.static(path.join(import.meta.dir, '../example')));
app.use('/html', express.static(path.join(import.meta.dir, '../html')));
app.use("/detective-game", express.static(path.join(import.meta.dir, '../detective')));

app.get("/api", async (req, res) => {
  const query = req.query as Query;
  let choice = (query.choice ?? "") as string;
  const response = await fetchChoice(choice, query.model ?? undefined, query.creature ?? undefined);
  return query.jsonp ? res.send(`${query.jsonp}(${JSON.stringify(response)})`) : res.json(response);
});

app.get("ping", (req, res) => {
  res.json({ success: true });
});

app.get("/index.html", async (req, res) => {
  return res.sendFile(path.join(import.meta.dir, "../index.html"));
});

app.get("/", (req, res) => {
  res.send(`
  <html>
  <head>
  <title>OpenAI NPC Dialog Generator</title>
    
    <style>
/* CSS */
.button-15 {
  text-decoration: none;
  background-image: linear-gradient(#42A1EC, #0070C9);
  border: 1px solid #0077CC;
  border-radius: 4px;
  box-sizing: border-box;
  color: #FFFFFF;
  cursor: pointer;
  direction: ltr;
  display: block;
  font-family: "SF Pro Text","SF Pro Icons","AOS Icons","Helvetica Neue",Helvetica,Arial,sans-serif;
  font-size: 17px;
  font-weight: 400;
  letter-spacing: -.022em;
  line-height: 1.47059;
  min-width: 30px;
  overflow: visible;
  padding: 4px 15px;
  text-align: center;
  vertical-align: baseline;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  white-space: nowrap;
}

.button-15:disabled {
  cursor: default;
  opacity: .3;
}

.button-15:hover {
  background-image: linear-gradient(#51A9EE, #147BCD);
  border-color: #1482D0;
  text-decoration: underline;
}

.button-15:active {
  background-image: linear-gradient(#3D94D9, #0067B9);
  border-color: #006DBC;
  outline: none;
}

.button-15:focus {
  box-shadow: rgba(131, 192, 253, 0.5) 0 0 0 3px;
  outline: none;
}
    </style>
  </head>
  <body>
  <h1>NPC Dialog Generator using OpenAI</h1>
  <h4><b>Author:</b> <a href="https://github.com/jacklehamster">jacklehamster</a></h4>
  <hr>
  <div style="white-space: pre">
  To use this API, first call: "/api", then provide the following query parameters:
  - choice [optional]: Choices separated by "|". Ex: choice=A|B|A|C
    (note that you must include previous choices to continue a conversation).
    You can also insert custom choices like choice=pizza|A
  - model [optional]: The chatgpt model to use.
    List at: https://platform.openai.com/docs/models
  - creature [optional]: A description of the creature. Default is "an angel with wings".
  </div>
  <div>
    You can check out the NPC dialog demo, which uses this API. Click here:
    <br>
    <div style="display: flex; gap: 50px; margin: 40px; text-align: center">
      <div>
        <h1>DEMO</h1>
        <a href="example" class="button-15" role="button">NPC Dialog Demo</a>
      </div>
      <div>
        <h1>Test the API</h1>
        <a id="api-link" href="api" class="button-15" role="button">/api</a>
      </div>
    </div>
    <hr>

    <script>
      document.getElementById("api-link").textContent = location.protocol + location.hostname + "/api";
    </script>
  </div>
  <div>
    Source on Github:
    <a href="https://github.com/jacklehamster/open-ai-npc?tab=readme-ov-file#open-ai-npc">https://github.com/jacklehamster/open-ai-npc</a>
  </div>

  <div style="margin: 20px">
    <iframe width="560" height="315" src="https://www.youtube.com/embed/SGSDGGPVYyw?si=i0zIqUgfdU5U5Vt5" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
  </div>

  </body>
  </html>
  `);
});

function listRoutes() {
  const routes: Record<string, string[]> = {}
  app._router.stack.forEach((middleware: { route: { methods: {}; path: any; }; name: string; handle: { stack: any[]; }; }) => {
    if (middleware.route) { // Route middleware
      routes[middleware.route.path] = routes[middleware.route.path] ?? [];
      routes[middleware.route.path].push(...Object.keys(middleware.route.methods).map(m => m.toUpperCase()));
    } else if (middleware.name === 'router') { // Router middleware
      middleware.handle.stack.forEach((handler: { route: { methods: {}; path: any; }; }) => {
        if (handler.route) {
          routes[handler.route.path] = routes[handler.route.path] ?? [];
          routes[handler.route.path].push(...Object.keys(handler.route.methods).map(m => m.toUpperCase()));
        }
      });
    }
  });
  return routes;
}

app.get('/routes', (req, res) => {
  res.json(listRoutes());
});

//  Power Troll API
interface CommentQuery {
  dictionary?: string;
  situation?: string;
  model?: string;
  seed?: string;
  jsonp?: string;
  authorizationCode?: string;
}

app.get("/comment", async (req, res) => {
  const query = req.query as CommentQuery;
  const { situation, model, seed, dictionary, authorizationCode, jsonp, ...customFields } = query;
  let situations = ((situation ?? "") as string).split(".");
  const cf: Record<string, { type: string; value: any }> = {};
  Object.entries(customFields).forEach(([kString, value]) => {
    const [key, type] = kString.split(":");
    cf[key] = {
      type,
      value,
    };
  });
  const response = await makeComment(
    situations, model as ChatModel, seed, dictionary ? JSON.parse(dictionary) : undefined,
    query.authorizationCode, cf
  );
  const formattedResponse = typeof (response) === "object" ? response : {
    response,
  };
  return query.jsonp ? res.type('.js').send(`${query.jsonp}(${JSON.stringify(formattedResponse)})`) : res.json(formattedResponse);
});

addRoutes(app, {
  github: {
    owner: "jacklehamster",
    repo: "power-troll-levels",
  },
  secret: {
    secret: process.env.SECRET_WORD ?? "secret",
  },
  nocache: true,
  nolock: true,
  moderator,
});

const definitionManager = new DefinitionManager();
definitionManager.addWordRoutes(app);
const translateManager = new TranslateManager();
translateManager.addTranslateRoutes(app);
const detectiveManager = new DetectiveManager();
detectiveManager.addDetective(app);

addCustomRoute(app);

const options = {
  host: '0.0.0.0', // Listen on all network interfaces
  port,
};

const server = http.createServer(app);

//  Web socket
const wss = new WebSocketServer({ server });

attachSyncSocket(wss);

// //  Promo codes
// attachPromoCodes(app, "/promo", {
//   useRedis: false,
// });
//  Eats too much memory

server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}/`);
  const address = server.address();
  console.log(address);
});

export { npc, fetchChoice };
export type { NpcModel };
