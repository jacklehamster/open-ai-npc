import OpenAI from "openai";


export const openai = new OpenAI({
  baseURL: process.env.OPENAI_TROLL_BASEURL,
  apiKey: process.env.OPENAI_TROLL_KEY,
  organization: process.env.OPENAI_ORGANIZATION ?? 'org-uktBsveUaXeMNXTgnjk5JlBA',
  project: process.env.OPENAI_TROLL_PROJECT ?? 'proj_14nsI578VavWlr7T8forl9jv',
});
