# VIRALWIRE

**The stories taking over the internet.**

Cloudflare Pages + Astro + D1 viral trends/editorial site.

## Included

- Modern responsive editorial homepage
- Trending, categories, search and story pages
- Related stories and X sharing
- SEO, Open Graph, Twitter cards, sitemap, RSS and robots
- Private Vault Control at /admin
- Create, edit, save draft, publish and delete stories
- Simple rich-text editor
- D1 view counter and trending ranking
- Centralized Monetag component
- Demo fallback stories before D1 is connected
- No wrangler.toml

## Cloudflare setup

1. Create a D1 database.
2. Run `db/schema.sql`.
3. Add a Pages D1 binding named **DB**.
4. Add environment variables:
   - `ADMIN_PASSWORD`
   - `SITE_URL`
   - `PUBLIC_MONETAG_SCRIPT_URL` (optional)
   - `PUBLIC_MONETAG_ZONE_ID` (optional)
5. Build command: `npm run build`
6. Output directory: `dist`

Do not commit passwords or API keys to GitHub.


## Multilingual setup

VIRALWIRE supports locale-prefixed URLs for English, Serbian, German, Spanish, French, Italian and Portuguese:

- `/en/` — English
- `/sr/` — Serbian
- `/de/` — German
- `/es/` — Spanish
- `/fr/` — French
- `/it/` — Italian
- `/pt/` — Portuguese

The existing unprefixed English URLs remain valid, so existing links are not broken. The locale middleware rewrites prefixed URLs internally while preserving the selected language for navigation, canonical URLs and hreflang tags.

Run the full contents of `db/schema.sql` against the D1 database. The schema includes `story_translations`, which stores translated title, excerpt, article HTML, tags, X post and localized slug for each language.

In Admin → Edit Story, use the language tabs to create and publish translations. A missing translation falls back to the original English story until a published translation exists.
