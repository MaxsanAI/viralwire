import type {APIRoute} from "astro";

const MAX_SIZE = 8 * 1024 * 1024;
const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"]
]);

export const POST: APIRoute = async ({request, cookies, locals}) => {
  if (cookies.get("vw_admin")?.value !== "1") {
    return new Response(JSON.stringify({error:"Unauthorized."}), {
      status:401,
      headers:{"Content-Type":"application/json"}
    });
  }

  const bucket = locals.runtime?.env?.MEDIA;
  if (!bucket) {
    return new Response(JSON.stringify({error:"R2 MEDIA binding is not configured."}), {
      status:503,
      headers:{"Content-Type":"application/json"}
    });
  }

  const form = await request.formData();
  const value = form.get("image");

  if (!(value instanceof File)) {
    return new Response(JSON.stringify({error:"No image selected."}), {
      status:400,
      headers:{"Content-Type":"application/json"}
    });
  }

  const extension = ALLOWED.get(value.type);
  if (!extension) {
    return new Response(JSON.stringify({error:"Use JPG, PNG, WebP or GIF."}), {
      status:415,
      headers:{"Content-Type":"application/json"}
    });
  }

  if (value.size <= 0 || value.size > MAX_SIZE) {
    return new Response(JSON.stringify({error:"Image must be between 1 byte and 8 MB."}), {
      status:413,
      headers:{"Content-Type":"application/json"}
    });
  }

  const key = "images/" + crypto.randomUUID() + "." + extension;
  const body = await value.arrayBuffer();

  await bucket.put(key, body, {
    httpMetadata: {
      contentType: value.type,
      cacheControl: "public, max-age=31536000, immutable"
    }
  });

  return new Response(JSON.stringify({
    url: "/media/" + key,
    key
  }), {
    headers:{"Content-Type":"application/json"}
  });
};
