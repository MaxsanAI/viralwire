import type { APIRoute } from "astro";

const esc=(value:string)=>value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");

export const POST:APIRoute=async({request,locals})=>{
  try{
    const body=await request.json();
    const name=String(body?.name||"").trim();
    const email=String(body?.email||"").trim();
    const category=String(body?.category||"General").trim();
    const subject=String(body?.subject||"").trim();
    const message=String(body?.message||"").trim();
    const website=String(body?.website||"").trim();

    if(website)return new Response(JSON.stringify({ok:true}),{headers:{"Content-Type":"application/json"}});
    if(!name||!email||!subject||!message)return new Response(JSON.stringify({error:"Please complete all fields."}),{status:400,headers:{"Content-Type":"application/json"}});
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return new Response(JSON.stringify({error:"Please enter a valid email address."}),{status:400,headers:{"Content-Type":"application/json"}});
    if(name.length>100||email.length>160||subject.length>180||message.length>5000)return new Response(JSON.stringify({error:"One or more fields are too long."}),{status:400,headers:{"Content-Type":"application/json"}});

    const env=locals.runtime?.env||{};
    const key=String(env.RESEND_API_KEY||"");
    if(!key)throw new Error("Contact email is not configured.");

    const safeCategory=["General","News Tip","Correction","Partnership","Other"].includes(category)?category:"General";
    const r=await fetch("https://api.resend.com/emails",{
      method:"POST",
      headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},
      body:JSON.stringify({
        from:String(env.NEWSLETTER_FROM||"VIRALWIRE <newsletter@pulserapp.com>"),
        to:["maxsansamurai@gmail.com"],
        reply_to:email,
        subject:`VIRALWIRE Contact — ${safeCategory} — ${subject}`,
        html:`<!doctype html><html><body style="font-family:Arial,sans-serif;color:#151820"><h2>VIRALWIRE Contact</h2><p><strong>Category:</strong> ${esc(safeCategory)}</p><p><strong>Name:</strong> ${esc(name)}</p><p><strong>Email:</strong> ${esc(email)}</p><p><strong>Subject:</strong> ${esc(subject)}</p><hr><p style="white-space:pre-wrap;line-height:1.6">${esc(message)}</p></body></html>`
      })
    });
    if(!r.ok)throw new Error((await r.text())||"Resend rejected the message.");
    return new Response(JSON.stringify({ok:true}),{headers:{"Content-Type":"application/json"}});
  }catch(error){
    return new Response(JSON.stringify({error:error instanceof Error?error.message:"Could not send your message."}),{status:500,headers:{"Content-Type":"application/json"}});
  }
};
