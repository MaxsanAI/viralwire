import type {APIRoute} from "astro";
import {isLocale, localeNames} from "../../../lib/i18n";

const MODEL = "@cf/zai-org/glm-4.7-flash";

const json = (body:Record<string,unknown>, status=200) =>
  new Response(JSON.stringify(body), {status, headers: {"Content-Type":"application/json"}});

const protectHtml = (html:string) => {
  const tags:string[] = [];
  const protectedText = html.replace(/<[^>]+>/g, tag => {
    const token = `@@VWTAG${tags.length}@@`;
    tags.push(tag);
    return token;
  });
  return {protectedText, tags};
};

const restoreHtml = (text:string, tags:string[]) =>
  text.replace(/@@VWTAG(\d+)@@/g, (_match, index) => tags[Number(index)] ?? _match);

const translate = async (ai:Ai, text:string, target:string, html=false) => {
  if(!text.trim()) return "";
  const protectedValue = html ? protectHtml(text) : null;
  const input = protectedValue?.protectedText ?? text;
  const language = localeNames[target as keyof typeof localeNames] || target;

  const prompt = html
    ? `Translate the following English article into ${language}.
Translate naturally and professionally.
IMPORTANT:
- Return ONLY the translated article.
- Preserve every token like @@VWTAG0@@ exactly as written and in the same position.
- Do not add, remove, rename, or reorder HTML represented by those tokens.
- Do not translate URLs, image URLs, HTML attributes, or token text.
- Do not add commentary, Markdown fences, or explanations.
- Keep the paragraph and heading structure exactly as supplied.

ARTICLE:
${input}`
    : `Translate the following English text into ${language}.
Return ONLY the translation. Preserve URLs, @handles, hashtags, product names, and proper names. Do not add commentary.

TEXT:
${input}`;

  const response:any = await ai.run(MODEL, {
    messages: [
      {role:"system", content:"You are a professional human-quality translator. Never explain your work."},
      {role:"user", content:prompt}
    ],
    temperature:0.2,
    max_completion_tokens:12000
  });

  const output = String(response?.choices?.[0]?.message?.content ?? response?.response ?? "").trim();
  if(!output) throw new Error("Cloudflare AI returned an empty translation.");
  return html && protectedValue ? restoreHtml(output, protectedValue.tags) : output;
};

export const POST:APIRoute = async ({request,cookies,locals}) => {
  if(cookies.get("vw_admin")?.value !== "1") return json({error:"Unauthorized."},401);

  const db = locals.runtime?.env?.DB;
  const ai = locals.runtime?.env?.AI;
  if(!db) return json({error:"D1 is not configured."},503);
  if(!ai) return json({error:"Workers AI binding is not configured. Add a binding named AI in Cloudflare."},503);

  let body:any;
  try { body = await request.json(); } catch { return json({error:"Invalid request."},400); }

  const id = Number(body?.story_id);
  const language = String(body?.language || "");
  if(!Number.isInteger(id) || id <= 0) return json({error:"Invalid story ID."},400);
  if(!isLocale(language) || language === "en") return json({error:"Choose a non-English target language."},400);

  const story:any = await db.prepare("SELECT * FROM stories WHERE id=? LIMIT 1").bind(id).first();
  if(!story) return json({error:"Story not found."},404);

  try {
    const [title,excerpt,content,tags,xPost] = await Promise.all([
      translate(ai,String(story.title || ""),language),
      translate(ai,String(story.excerpt || ""),language),
      translate(ai,String(story.content || ""),language,true),
      translate(ai,String(story.tags || ""),language),
      translate(ai,String(story.x_post || ""),language)
    ]);

    const status = story.status === "published" ? "published" : "draft";
    await db.prepare(`INSERT INTO story_translations
      (story_id,language,slug,title,excerpt,content,tags,x_post,status,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)
      ON CONFLICT(story_id,language) DO UPDATE SET
      slug=excluded.slug,title=excluded.title,excerpt=excluded.excerpt,content=excluded.content,
      tags=excluded.tags,x_post=excluded.x_post,status=excluded.status,updated_at=CURRENT_TIMESTAMP`)
      .bind(id,language,story.slug,title,excerpt,content,tags,xPost,status)
      .run();

    return json({ok:true,language,languageName:localeNames[language],message:`Translated to ${localeNames[language]} and saved.`});
  } catch(error) {
    return json({error:error instanceof Error ? error.message : "Translation failed."},500);
  }
};
