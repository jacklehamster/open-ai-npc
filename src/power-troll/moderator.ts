import { openai } from "./openai/openai";


async function sendSlackData(data: any) {
  const hook = "https://hooks.slack.com/services/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"
  return fetch(hook, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    },
  })
}


export async function moderator(imageUrl: string) {

  const moderation = await openai.moderations.create({
    model: "omni-moderation-latest",
    input: [
      {
        type: "image_url",
        image_url: {
          url: imageUrl
        }
      }
    ],
  });
  if (moderation?.results[0]?.flagged) {
    await sendSlackData({ text: `Image: ${imageUrl}\n\`\`\`\n${JSON.stringify(moderation, null, 1)}\`\`\`` });
  }
  return true;
}
