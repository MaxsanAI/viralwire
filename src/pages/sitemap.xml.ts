import type {APIRoute} from "astro";
import {locales} from "../lib/i18n";

export const GET:APIRoute=({locals})=>{
  const base=(locals.runtime?.env?.SITE_URL||"https://viralwire.pulserapp.com").replace(/\/$/,"");
  const now=new Date().toISOString();
  const xml=locales.map(locale=>
    "<sitemap><loc>"+base+"/sitemap/"+locale+".xml</loc><lastmod>"+now+"</lastmod></sitemap>"
  ).join("");
  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+xml+"</sitemapindex>",
    {headers:{"Content-Type":"application/xml; charset=utf-8","Cache-Control":"public, max-age=3600"}}
  );
};
