import type {APIRoute} from "astro";
import {getPublishedStories} from "../../lib/db";
import {locales,localePath} from "../../lib/i18n";

const esc=(s:string)=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

export const GET:APIRoute=async({locals,params})=>{
  const locale=params.locale||"en";
  if(!locales.includes(locale as typeof locales[number])){
    return new Response("Not found",{status:404});
  }

  const base=(locals.runtime?.env?.SITE_URL||"https://viralwire.pulserapp.com").replace(/\/$/,"");
  const stories=await getPublishedStories(locals,50000);
  const paths=[
    "/",
    "/trending",
    ...stories.map(s=>"/story/"+s.slug),
    ...stories.map(s=>"/category/"+s.category.toLowerCase().replace(/[^a-z0-9]+/g,"-"))
  ];
  const unique=[...new Set(paths.map(path=>localePath(locale as typeof locales[number],path)))];
  const xml=unique.map((path,index)=>{
    const story=index>=2 && index<stories.length+2 ? stories[index-2] : null;
    const lastmod=story?.published_at?new Date(story.published_at).toISOString():null;
    return "<url><loc>"+esc(base+path)+"</loc>"+(lastmod?"<lastmod>"+lastmod+"</lastmod>":"")+"</url>";
  }).join("");

  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+xml+"</urlset>",
    {headers:{"Content-Type":"application/xml; charset=utf-8","Cache-Control":"public, max-age=3600"}}
  );
};
