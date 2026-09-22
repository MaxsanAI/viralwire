import type {APIRoute} from "astro";
import {isLocale, localeNames} from "../../../lib/i18n";

const MODEL = "@cf/zai-org/glm-4.7-flash";

const json = (body:Record<string,unknown>, status=200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {"Content-Type":"application/json"}
  });

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
  text.replace(/@@VWTAG(\d+)@@/g, (_match, index) =>
    tags[Number(index)] ?? _match
  );

const getOutput = (response:any) =>
  String(
    response?.choices?.[0]?.message?.content ??
    response?.response ??
    ""
  ).trim();

const translateArticle = async (
  ai:Ai,
  text:string,
  target:string
) => {
  if(!text.trim()) return "";

  const protectedValue = protectHtml(text);
  const language =
    localeNames[target as keyof typeof localeNames] || target;

  const prompt = `Translate this English news article into ${language}.

This is an editorial translation, NOT a rewrite or summary.

STRICT RULES:
- Translate the meaning faithfully.
- Use natural, professional native ${language}.
- Do not invent, add, remove, shorten, or expand information.
- Keep the exact paragraph and heading structure.
- Preserve every token such as @@VWTAG0@@ exactly.
- Never translate or modify tokens, URLs, image URLs, HTML attributes, names, brands, @handles or hashtags.
- Preserve punctuation and paragraph breaks where possible.
- Return ONLY the translated article.
- No explanations, notes, Markdown fences or commentary.

ARTICLE:
${protectedValue.protectedText}`;

  const response:any = await ai.run(MODEL, {
    messages: [
      {
        role:"system",
        content:
          "You are a precise professional news translator. Translate faithfully. Never rewrite, summarize or explain."
      },
      {role:"user", content:prompt}
    ],
    temperature:0.1,
    max_completion_tokens:12000
  });

  const output = getOutput(response);
  if(!output) throw new Error("Cloudflare AI returned an empty translation.");

  return restoreHtml(output, protectedValue.tags);
};

const translateMetadata = async (
  ai:Ai,
  story:any,
  target:string
) => {
  const language =
    localeNames[target as keyof typeof localeNames] || target;

  const prompt = `Translate these VIRALWIRE article fields from English into ${language}.

Return EXACTLY this format and nothing else:

<<<TITLE>>>
translated title
<<<EXCERPT>>>
translated excerpt
<<<XPOST>>>
translated X post

RULES:
- Translate faithfully; do not rewrite or summarize.
- The title must sound natural and journalistic in ${language}.
- Do NOT translate or alter names, brands, places, @handles, URLs or hashtags.
- Do not invent words or information.
- No commentary or Markdown.

TITLE:
${String(story.title || "")}

EXCERPT:
${String(story.excerpt || "")}

X POST:
${String(story.x_post || "")}`;

  const response:any = await ai.run(MODEL, {
    messages: [
      {
        role:"system",
        content:
          "You are a precise professional news translator. Preserve names and meaning exactly."
      },
      {role:"user", content:prompt}
    ],
    temperature:0.1,
    max_completion_tokens:2500
  });

  const output = getOutput(response);

  const titleMatch = output.match(/<<<TITLE>>>\s*([\s\S]*?)\s*<<<EXCERPT>>>/i);
  const excerptMatch = output.match(/<<<EXCERPT>>>\s*([\s\S]*?)\s*<<<XPOST>>>/i);
  const xPostMatch = output.match(/<<<XPOST>>>\s*([\s\S]*?)\s*$/i);

  if(!titleMatch || !excerptMatch || !xPostMatch) {
    throw new Error("Cloudflare AI returned an invalid translation format.");
  }

  return {
    title:titleMatch[1].trim(),
    excerpt:excerptMatch[1].trim(),
    xPost:xPostMatch[1].trim()
  };
};

export const POST:APIRoute = async ({request,cookies,locals}) => {
  if(cookies.get("vw_admin")?.value !== "1") {
    return json({error:"Unauthorized."},401);
  }

  const db = locals.runtime?.env?.DB;
  const ai = locals.runtime?.env?.AI;

  if(!db) return json({error:"D1 is not configured."},503);

  if(!ai) {
    return json({
      error:"Workers AI binding is not configured. Add a binding named AI in Cloudflare."
    },503);
  }

  let body:any;
  try {
    body = await request.json();
  } catch {
    return json({error:"Invalid request."},400);
  }

  const id = Number(body?.story_id);
  const language = String(body?.language || "");

  if(!Number.isInteger(id) || id <= 0) {
    return json({error:"Invalid story ID."},400);
  }

  if(!isLocale(language) || language === "en") {
    return json({error:"Choose a non-English target language."},400);
  }

  const story:any = await db
    .prepare("SELECT * FROM stories WHERE id=? LIMIT 1")
    .bind(id)
    .first();

  if(!story) return json({error:"Story not found."},404);

  try {
    const [article, metadata] = await Promise.all([
      translateArticle(ai,String(story.content || ""),language),
      translateMetadata(ai,story,language)
    ]);

    // Tags are metadata, not article prose. Keep the original English tags
    // so the same tags remain usable across all language versions.
    const tags = String(story.tags || "");

    const status =
      story.status === "published" ? "published" : "draft";

    await db.prepare(`INSERT INTO story_translations
      (story_id,language,slug,title,excerpt,content,tags,x_post,status,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)
      ON CONFLICT(story_id,language) DO UPDATE SET
      slug=excluded.slug,
      title=excluded.title,
      excerpt=excluded.excerpt,
      content=excluded.content,
      tags=excluded.tags,
      x_post=excluded.x_post,
      status=excluded.status,
      updated_at=CURRENT_TIMESTAMP`)
      .bind(
        id,
        language,
        story.slug,
        metadata.title,
        metadata.excerpt,
        article,
        tags,
        metadata.xPost,
        status
      )
      .run();

    return json({
      ok:true,
      language,
      languageName:localeNames[language],
      message:`Translated to ${localeNames[language]} and saved.`
    });
  } catch(error) {
    return json({
      error:error instanceof Error
        ? error.message
        : "Translation failed."
    },500);
  }
};
