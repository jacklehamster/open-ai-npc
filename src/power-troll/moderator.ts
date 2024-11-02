import { openai } from "./openai/openai";



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
  console.log(JSON.stringify(moderation, null, 2));


  return !moderation?.results[0]?.flagged;
}
