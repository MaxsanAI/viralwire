import type {APIRoute} from "astro";
export const GET:APIRoute=({cookies,redirect})=>{cookies.delete("vw_admin",{path:"/"});return redirect("/admin/login")};