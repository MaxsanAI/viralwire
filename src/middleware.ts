import { defineMiddleware } from "astro:middleware";
import { isLocale, type Locale } from "./lib/i18n";

export const onRequest = defineMiddleware((context,next) => {
  const pathname = context.url.pathname;
  const first = pathname.split("/")[1];
  const locale = isLocale(first) ? first : "en";
  context.locals.locale = locale as Locale;

  if (isLocale(first)) {
    const stripped = pathname.slice(first.length + 1) || "/";
    return next(stripped);
  }

  return next();
});
