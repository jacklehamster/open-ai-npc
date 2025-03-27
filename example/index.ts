import Bao from "baojs";
import serveStatic from "serve-static-bun";

const port = parseInt(process.env.PORT || "4000");

const app = new Bao();

app.get("/*any", serveStatic("/", { middlewareMode: "bao" }));

const server = app.listen({ port });
console.log(`Listening on http://localhost:${server.port}`);
