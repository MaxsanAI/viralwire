/// <reference types="astro/client" />
type D1Database = import("@cloudflare/workers-types").D1Database;
import type { Locale } from "./lib/i18n";
declare namespace App {
  interface Locals {
    locale: Locale;
    runtime:{env:{
      DB?:D1Database;
      ADMIN_PASSWORD?:string;
      SITE_URL?:string;
      PUBLIC_MONETAG_SCRIPT_URL?:string;
      PUBLIC_MONETAG_ZONE_ID?:string;
    }};
  }
}