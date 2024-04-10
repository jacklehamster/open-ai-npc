# open-ai-npc

[![npm version](https://badge.fury.io/js/open-ai-npc.svg)](https://www.npmjs.com/package/open-ai-npc)

Using OpenAI to generate NPC dialog for characters in a JRPG.

![](https://jacklehamster.github.io/open-ai-npc/icon.png)

## Run example

### TRY OUT API

[https://jacklehamster.github.io/open-ai-npc/](https://jacklehamster.github.io/open-ai-npc/)

### Test dialog

## Github Source

[https://github.com/jacklehamster/open-ai-npc/](https://github.com/jacklehamster/open-ai-npc/)


# Using the API

Let's say you want to grab the repo, and setup your own project using the NPC dialog generator, perhaps tweak it so it gives you better results. You can do that! (This is an open source project after all).

Here are the steps below:

## Fork and download the repo

```bash
gh repo clone jacklehamster/open-ai-npc
```

Or personally, I prefer UI based Git app like [SourceTree](https://www.sourcetreeapp.com/)


## Get your OpenAI api key

- Go to https://platform.openai.com/, sign up for a new account
- Buy some credits. Note that $5 is enough to get started.
- Grab your API key from https://platform.openai.com/api-keys

## Store your API key locally

Add a bash command to save your OpenAPI key

```bash
export OPENAI_API_KEY=sk-?????
```

## Check out the demo

Just run `./sample.sh`, then go to http://localhost:3000/

From there, you can test the demo or try out the rest API.

Note that a bunch of pre-filled data is cached in the ".node-persist" folder, so initially you won't hit OpenAI API. To clear the cache, just delete that folder.

## Test the API

Go to http://localhost:3000/api

Then select a choice, and use it as query parameter:
http://localhost:3000/api?choice=A

To go further, you have to append your new choice to the choice history, separated by "|". Ex:
http://localhost:3000/api?choice=A|B
http://localhost:3000/api?choice=A|B|A

If your choice is a letter A,B,C or D, the choice from the AI will be selected. That said, you can write pretty much anything in the choice. If the AI is not confused, it will respond accordingly.

Ex:
http://localhost:3000/api?choice=your%20name

## Using a different model

The entry point to call the API is in [choices.ts](src/choices.ts):
```typescript
fetchChoice(choice: string,
  model: string = "gpt-3.5-turbo-1106",
  creature: string = "an angel with wings") {

}
```

By default, we're using `gpt-3.5-turbo-1106` because it's the cheapest one. It does have mixed results, but good enough for demoing. You can upgrade to `gpt-4-turbo`. It'll give you better results but costs a bit more.

You can also pass a different creature description.

## Updating the prompt

While it took me quite some time to refine the prompt for OpenAI to give me consistent result, you can play around with it to improve it, or expand it to return some new game information.

The prompt is stored in the file [systemprompt.ts](src/systemprompt.ts).

## Testing it out

Once done, you can run:

```bash
./sample.sh
```

And test both the API and the demo.

## Host on your own server

You need a server that can host Bun.js. You will also need to store the Open API key in your server's environment variable.

Then start the bun application

```bash
bun start
```

## Note about the .node-persist/storage

As you make calls to OpenAI API through the open-ai-npc API, the app caches every response into the `.node-persist/storage` folder. This is helpful to keep you from spending all your OpenAI credits on repeated queries.

That said, if something funky happens, feel free to wipe out that folder.

Since that folder is checked in, you can actually test out a few paths and check in the cache. That way, your server will hit all that built-in cache when new users try your API.

## OpenAI cost

So far, I've spend ~$1 of OpenAI credits, using the cheapest model. So it's not all that bad. The cache helps to bring the cost down.

If you're not cheapskate like me, you can up the model to "gpt-4". I tested it for a bit, and the responses seemed a bit more creative, and less wonky.

## Final words

I hope you enjoy using this API, and have fun!
