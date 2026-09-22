/// <reference types="astro/client" />
type D1Database = import("@cloudflare/workers-types").D1Database;
type R2Bucket = import("@cloudflare/workers-types").R2Bucket;
type Ai = import("@cloudflare/workers-types").Ai;
import type { Locale } from "./lib/i18n";
declare namespace App {
  interface Locals {
    locale: Locale;
    runtime:{env:{
      DB?:D1Database;
      MEDIA?:R2Bucket;
      AI?:Ai;
      ADMIN_PASSWORD?:string;
      SITE_URL?:string;
      PUBLIC_MONETAG_SCRIPT_URL?:string;
      PUBLIC_MONETAG_ZONE_ID?:string;
    }};
  }
}