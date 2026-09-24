import type {App} from "astro";

export async function ensureAnalyticsTable(db:any){
  await db.prepare(`CREATE TABLE IF NOT EXISTS analytics_pageviews(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'Unknown',
    referrer TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  )`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_analytics_pageviews_created_at ON analytics_pageviews(created_at)`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_analytics_pageviews_path ON analytics_pageviews(path)`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_analytics_pageviews_country ON analytics_pageviews(country)`).run();
}

export async function recordPageView(locals:App.Locals,request:Request,path:string){
  const db=locals.runtime?.env?.DB;
  if(!db || !path || path.startsWith("/admin") || path.startsWith("/api")) return;
  const country=String((locals.runtime as any)?.cf?.country||"Unknown").slice(0,8);
  const referrer=String(request.headers.get("referer")||"").slice(0,500);
  const createdAt=new Date().toISOString();
  const job=(async()=>{
    try{
      await ensureAnalyticsTable(db);
      await db.prepare("INSERT INTO analytics_pageviews(path,country,referrer,created_at) VALUES(?,?,?,?)")
        .bind(path,country,referrer,createdAt).run();
    }catch{}
  })();
  const waitUntil=(locals.runtime as any)?.ctx?.waitUntil;
  if(typeof waitUntil==="function") waitUntil.call((locals.runtime as any).ctx,job);
  else await job;
}

export function referrerLabel(value:string){
  if(!value) return "Direct / Unknown";
  try{
    const u=new URL(value);
    return u.hostname.replace(/^www\./,"");
  }catch{return value.slice(0,80);}
}
