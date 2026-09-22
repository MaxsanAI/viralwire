import {demoStories,type Story} from "./demo";
import {getLocale} from "./i18n";

function mapStory(r:any):Story{
  return {
    id:Number(r.id),
    slug:r.slug,
    title:r.title,
    excerpt:r.excerpt||"",
    content:r.content||"",
    category:r.category||"Viral",
    tags:r.tags||"",
    cover_image:r.cover_image||"",
    x_post:r.x_post||"",
    status:r.status||"draft",
    published_at:r.published_at,
    views:Number(r.views||0)
  };
}

export async function getPublishedStories(locals:App.Locals,limit=30){
  const db=locals.runtime?.env?.DB;
  const locale=getLocale(locals);
  if(!db)return demoStories.slice(0,limit);
  try{
    const r=await db.prepare(`SELECT s.*,
      CASE WHEN ?='en' THEN s.slug ELSE COALESCE(st.slug,s.slug) END AS slug,
      CASE WHEN ?='en' THEN s.title ELSE COALESCE(st.title,s.title) END AS title,
      CASE WHEN ?='en' THEN s.excerpt ELSE COALESCE(st.excerpt,s.excerpt) END AS excerpt,
      CASE WHEN ?='en' THEN s.content ELSE COALESCE(st.content,s.content) END AS content,
      CASE WHEN ?='en' THEN s.tags ELSE COALESCE(st.tags,s.tags) END AS tags,
      CASE WHEN ?='en' THEN s.x_post ELSE COALESCE(st.x_post,s.x_post) END AS x_post
      FROM stories s
      LEFT JOIN story_translations st ON st.story_id=s.id AND st.language=? AND st.status='published'
      WHERE s.status='published'
      ORDER BY datetime(s.published_at) DESC LIMIT ?`)
      .bind(locale,locale,locale,locale,locale,locale,locale,limit).all();
    return r.results?.length?r.results.map(mapStory):demoStories.slice(0,limit);
  }catch{
    try{
      const r=await db.prepare("SELECT * FROM stories WHERE status='published' ORDER BY datetime(published_at) DESC LIMIT ?").bind(limit).all();
      return r.results?.length?r.results.map(mapStory):demoStories.slice(0,limit);
    }catch{return demoStories.slice(0,limit);}
  }
}

export async function getStoryBySlug(locals:App.Locals,slug:string){
  const db=locals.runtime?.env?.DB;
  const locale=getLocale(locals);
  if(!db)return demoStories.find(s=>s.slug===slug)||null;
  try{
    if(locale!=="en"){
      const translated=await db.prepare(`SELECT s.id,s.cover_image,s.category,s.status,s.published_at,s.views,
        st.slug,st.title,st.excerpt,st.content,st.tags,st.x_post
        FROM story_translations st
        JOIN stories s ON s.id=st.story_id
        WHERE st.language=? AND st.slug=? AND st.status='published' AND s.status='published' LIMIT 1`)
        .bind(locale,slug).all();
      if(translated.results?.[0])return mapStory(translated.results[0]);
    }
    const r=await db.prepare("SELECT * FROM stories WHERE slug=? AND status='published' LIMIT 1").bind(slug).all();
    return r.results?.[0]?mapStory(r.results[0]):demoStories.find(s=>s.slug===slug)||null;
  }catch{
    return demoStories.find(s=>s.slug===slug)||null;
  }
}

export async function searchStories(locals:App.Locals,q:string){
  const db=locals.runtime?.env?.DB;
  const locale=getLocale(locals);
  if(!db){
    const x=q.toLowerCase();
    return demoStories.filter(s=>[s.title,s.excerpt,s.category,s.tags].join(" ").toLowerCase().includes(x));
  }
  try{
    const l="%"+q.trim()+"%";
    const r=await db.prepare(`SELECT s.*,
      CASE WHEN ?='en' THEN s.slug ELSE COALESCE(st.slug,s.slug) END AS slug,
      CASE WHEN ?='en' THEN s.title ELSE COALESCE(st.title,s.title) END AS title,
      CASE WHEN ?='en' THEN s.excerpt ELSE COALESCE(st.excerpt,s.excerpt) END AS excerpt,
      CASE WHEN ?='en' THEN s.content ELSE COALESCE(st.content,s.content) END AS content,
      CASE WHEN ?='en' THEN s.tags ELSE COALESCE(st.tags,s.tags) END AS tags,
      CASE WHEN ?='en' THEN s.x_post ELSE COALESCE(st.x_post,s.x_post) END AS x_post
      FROM stories s
      LEFT JOIN story_translations st ON st.story_id=s.id AND st.language=? AND st.status='published'
      WHERE s.status='published' AND (
        (CASE WHEN ?='en' THEN s.title ELSE COALESCE(st.title,s.title) END) LIKE ?
        OR (CASE WHEN ?='en' THEN s.excerpt ELSE COALESCE(st.excerpt,s.excerpt) END) LIKE ?
        OR s.category LIKE ?
        OR (CASE WHEN ?='en' THEN s.tags ELSE COALESCE(st.tags,s.tags) END) LIKE ?
      )
      ORDER BY datetime(s.published_at) DESC LIMIT 50`)
      .bind(locale,locale,locale,locale,locale,locale,locale,locale,l,locale,l,l,locale,l).all();
    return r.results.map(mapStory);
  }catch{
    return [];
  }
}

export async function incrementViews(locals:App.Locals,id:number){
  const db=locals.runtime?.env?.DB;
  if(db&&id){try{await db.prepare("UPDATE stories SET views=views+1 WHERE id=?").bind(id).run()}catch{}}
}

export async function getRelatedStories(locals:App.Locals,s:Story){
  const all=await getPublishedStories(locals,50);
  return all.filter(x=>x.id!==s.id&&x.category===s.category)
    .concat(all.filter(x=>x.id!==s.id&&x.category!==s.category)).slice(0,4);
}
