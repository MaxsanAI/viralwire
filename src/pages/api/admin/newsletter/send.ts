import type {APIRoute} from "astro";
import {ensureNewsletterTables,newsletterHtml,sendEmail} from "../../../../lib/newsletter";

const json=(data:any,status=200)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}});

export const POST:APIRoute=async({locals,request})=>{
 try{
  if(locals.cookies.get("vw_admin")?.value!=="1")return json({error:"Unauthorized"},401);
  const env=locals.runtime?.env;
  const db=env?.DB;
  if(!db)return json({error:"D1 is not connected."},503);

  let b:any;
  try{b=await request.json()}catch(e){return json({error:"Invalid request JSON: "+(e instanceof Error?e.message:String(e))},400)}

  const subject=String(b?.subject||"").trim();
  const intro=String(b?.intro||"").trim();
  const ids=Array.isArray(b?.storyIds)?b.storyIds.map(Number).filter(Boolean):[];
  if(!subject)return json({error:"Enter a newsletter subject."},400);
  if(!ids.length)return json({error:"Select at least one story."},400);

  try{await ensureNewsletterTables(db)}catch(e){
   return json({error:"D1 newsletter table error: "+(e instanceof Error?e.message:String(e))},500);
  }

  let stories:any[]=[];
  try{
   const ph=ids.map(()=>"?").join(",");
   const sr=await db.prepare(`SELECT id,slug,title,excerpt,category,cover_image FROM stories WHERE status='published' AND id IN (${ph})`).bind(...ids).all<any>();
   stories=sr.results||[];
  }catch(e){
   return json({error:"D1 story query error: "+(e instanceof Error?e.message:String(e))},500);
  }

  if(!stories.length)return json({error:"The selected story was not found as published."},400);

  let subs:any[]=[];
  try{
   const rr=await db.prepare("SELECT id,email,confirmation_token FROM newsletter_subscribers WHERE status='subscribed' ORDER BY id ASC LIMIT 100").all<any>();
   subs=rr.results||[];
  }catch(e){
   return json({error:"D1 subscriber query error: "+(e instanceof Error?e.message:String(e))},500);
  }

  if(!subs.length)return json({error:"There are no confirmed subscribers yet."},400);

  const site=(env?.SITE_URL||"https://viralwire.pulserapp.com").replace(/\/$/,"");
  let sent=0;
  let failed=0;
  let lastError="";

  for(const s of subs){
   try{
    const token=s.confirmation_token||crypto.randomUUID();
    if(!s.confirmation_token)await db.prepare("UPDATE newsletter_subscribers SET confirmation_token=? WHERE id=?").bind(token,s.id).run();
    await sendEmail(env,s.email,subject,newsletterHtml(site,subject,intro,stories,token));
    sent++;
   }catch(e){
    failed++;
    lastError=e instanceof Error?e.message:String(e);
   }
  }

  try{
   await db.prepare("INSERT INTO newsletter_campaigns(subject,body,sent_at,recipient_count) VALUES(?,?,?,?)").bind(subject,intro,new Date().toISOString(),sent).run();
  }catch(e){
   if(sent>0)return json({message:`Newsletter sent to ${sent} subscriber${sent===1?"":"s"}, but campaign history could not be saved: ${e instanceof Error?e.message:String(e)}`});
   return json({error:"D1 campaign history error: "+(e instanceof Error?e.message:String(e))},500);
  }

  if(sent===0)return json({error:"Resend could not send the newsletter. "+(lastError||"Unknown delivery error.")},502);
  return json({message:`Newsletter sent to ${sent} subscriber${sent===1?"":"s"}.${failed?` ${failed} failed. First error: ${lastError}`:""}`});
 }catch(e){
  return json({error:"Newsletter endpoint runtime error: "+(e instanceof Error?e.stack||e.message:String(e))},500);
 }
};