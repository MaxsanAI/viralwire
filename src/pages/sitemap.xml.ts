import type {APIRoute} from "astro";
import {getPublishedStories} from "../lib/db";
import {locales,localePath} from "../lib/i18n";
const esc=(s:string)=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
export const GET:APIRoute=async({locals})=>{
  const base=(locals.runtime?.env?.SITE_URL||"https://viralwire.pages.dev").replace(/\/$/,"");
  const stories=await getPublishedStories(locals,100);
  const paths=["/","/trending",...stories.map(s=>"/story/"+s.slug),...stories.map(s=>"/category/"+s.category.toLowerCase().replace(/[^a-z0-9]+/g,"-"))];
  const all=[...new Set(paths.flatMap(path=>locales.map(locale=>localePath(locale,path))))];
  const xml=all.map(p=>"<url><loc>"+esc(base+p)+"</loc></url>").join("");
  return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+xml+"</urlset>",{headers:{"Content-Type":"application/xml"}});
};
