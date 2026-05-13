import fs from "fs";
import { cities } from "../src/data/cities.js";

const baseUrl = "https://crumbellainnovativefoods.in";

const staticUrls = [
  `${baseUrl}/`,
  `${baseUrl}/products`,
  `${baseUrl}/contact`,
  `${baseUrl}/cookies-in-india`,
];

const cityUrls = cities.map((city) => `${baseUrl}/cookies-in/${city}`);

const allUrls = [...staticUrls, ...cityUrls];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${allUrls
  .map(
    (url) => `
  <url>
    <loc>${url}</loc>
  </url>`,
  )
  .join("\n")}

</urlset>`;

fs.writeFileSync("./public/sitemap.xml", xml);

