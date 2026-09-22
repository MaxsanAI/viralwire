import type {APIRoute} from "astro";
import {slugify} from "../../../../lib/site";
import {isLocale} from "../../../../lib/i18n";
const clean=(v:string)=>v.replace(/<script[\s\S]*?<\/script>/gi,"").replace(/on\w+\s*=\s*["'][^"']*["']/gi,"");

export const POST:APIRoute=async({request,cookies,locals,params,redirect})=>{
  if(cookies.get("vw_admin")?.value!=="1")return redirect("/admin");
  const db=locals.runtime?.env?.DB;
  if(!db)return new Response("D1 is not configured.",{status:503});
  const id=Number(params.id);
  const f=await request.formData();
  const intent=String(f.get("intent")||"draft");
  const language=String(f.get("language")||"en");
  if(intent==="delete"&&language==="en"){
    await db.prepare("DELETE FROM stories WHERE id=?").bind(id).run();
    return redirect("/admin");
  }
  if(!isLocale(language))return new Response("Invalid language.",{status:400});

  const title=String(f.get("title")||"").trim();
  const excerpt=String(f.get("excerpt")||"").trim();
  const tags=String(f.get("tags")||"").trim();
  const xp=String(f.get("x_post")||"").trim();
  const content=clean(String(f.get("content")||""));
  const status=intent==="publish"?"published":"draft";
  const slug=slugify(title)||"story-"+id;

  if(language!=="en"){
    await db.prepare(`INSERT INTO story_translations
      (story_id,language,slug,title,excerpt,content,tags,x_post,status,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)
      ON CONFLICT(story_id,language) DO UPDATE SET
      slug=excluded.slug,title=excluded.title,excerpt=excluded.excerpt,content=excluded.content,
      tags=excluded.tags,x_post=excluded.x_post,status=excluded.status,updated_at=CURRENT_TIMESTAMP`)
      .bind(id,language,slug,title,excerpt,content,tags,xp,status).run();
    return redirect("/admin/edit/"+id+"?lang="+language);
  }

  const category=String(f.get("category")||"Viral");
  const cover=String(f.get("cover_image")||"").trim();
  await db.prepare("UPDATE stories SET slug=?,title=?,excerpt=?,content=?,category=?,tags=?,cover_image=?,x_post=?,status=?,published_at=?,updated_at=CURRENT_TIMESTAMP WHERE id=?")
    .bind(slug,title,excerpt,content,category,tags,cover,xp,status,new Date().toISOString(),id).run();
  return redirect("/admin");
};
