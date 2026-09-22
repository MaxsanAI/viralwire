import type {APIRoute} from "astro";

export const GET:APIRoute=({locals})=>{
  const base=(locals.runtime?.env?.SITE_URL||"https://viralwire.pulserapp.com").replace(/\/$/,"");
  const body=[
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /api",
    "",
    "User-agent: Googlebot",
    "Allow: /",
    "",
    "User-agent: Bingbot",
    "Allow: /",
    "",
    "User-agent: OAI-SearchBot",
    "Allow: /",
    "",
    "User-agent: ChatGPT-User",
    "Allow: /",
    "",
    "User-agent: GPTBot",
    "Allow: /",
    "",
    "User-agent: PerplexityBot",
    "Allow: /",
    "",
    "User-agent: ClaudeBot",
    "Allow: /",
    "",
    "User-agent: Google-Extended",
    "Allow: /",
    "",
    "Sitemap: "+base+"/sitemap.xml"
  ].join("\n");
  return new Response(body,{headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"public, max-age=3600"}});
};
