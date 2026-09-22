import type {APIRoute} from "astro";

const emailRe=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST:APIRoute=async({locals,request})=>{
  const db=locals.runtime?.env?.DB;
  if(!db)return new Response(JSON.stringify({error:"Newsletter is temporarily unavailable."}),{status:503,headers:{"Content-Type":"application/json"}});

  try{
    const body=await request.json() as {email?:string;website?:string};
    const email=String(body.email||"").trim().toLowerCase();
    const website=String(body.website||"").trim();

    if(website)return new Response(JSON.stringify({message:"You're in."}),{status:200,headers:{"Content-Type":"application/json"}});
    if(!emailRe.test(email)||email.length>254){
      return new Response(JSON.stringify({error:"Please enter a valid email address."}),{status:400,headers:{"Content-Type":"application/json"}});
    }

    await db.prepare(`CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'subscribed',
      consent_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`).run();

    const now=new Date().toISOString();
    await db.prepare(`INSERT INTO newsletter_subscribers (email,status,consent_at,created_at)
      VALUES (?,'subscribed',?,?)
      ON CONFLICT(email) DO UPDATE SET status='subscribed',consent_at=excluded.consent_at`)
      .bind(email,now,now).run();

    return new Response(JSON.stringify({message:"You're on the list. Watch your inbox."}),{status:200,headers:{"Content-Type":"application/json"}});
  }catch{
    return new Response(JSON.stringify({error:"We couldn't add you right now. Please try again."}),{status:500,headers:{"Content-Type":"application/json"}});
  }
};
