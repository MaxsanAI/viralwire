export const SITE_NAME="VIRALWIRE";
export const SITE_TAGLINE="The stories taking over the internet.";
export const categories=["Trending Now","X Stories","Viral","Politics & Culture","Tech & AI","Entertainment","Creators","Internet Drama","Travel"];
export function slugify(v:string){return v.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,90)}
export function formatDate(v:string|number|Date){return new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",year:"numeric"}).format(new Date(v))}
export function readingTime(html:string){const n=html.replace(/<[^>]+>/g," ").trim().split(/\s+/).filter(Boolean).length;return Math.max(1,Math.ceil(n/220))}
export function absoluteUrl(path:string,base="https://viralwire.pages.dev"){return new URL(path,base).toString()}