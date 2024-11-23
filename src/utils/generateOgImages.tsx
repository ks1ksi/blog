import { Resvg } from "@resvg/resvg-js";
import { type CollectionEntry } from "astro:content";
import fs from "fs";
import { type SatoriOptions } from "satori";
import postOgImage from "./og-templates/post";
import siteOgImage from "./og-templates/site";

const fetchFonts = async () => {
  // import font from "fonts/NotoSansKR-Regular.ttf"
  const fontRegular: ArrayBuffer = fs.readFileSync(
    "public/fonts/NotoSansKR-Regular.ttf",
  );

  // Bold Font
  const fontBold: ArrayBuffer = fs.readFileSync(
    "public/fonts/NotoSansKR-Bold.ttf",
  );

  return { fontRegular, fontBold };
};

const { fontRegular, fontBold } = await fetchFonts();

const options: SatoriOptions = {
  width: 1200,
  height: 630,
  embedFont: true,
  fonts: [
    {
      name: "Noto Sans KR",
      data: fontRegular,
      weight: 400,
      style: "normal",
    },
    {
      name: "Noto Sans KR",
      data: fontBold,
      weight: 600,
      style: "normal",
    },
  ],
};

function svgBufferToPngBuffer(svg: string) {
  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  return pngData.asPng();
}

export async function generateOgImageForPost(post: CollectionEntry<"blog">) {
  const svg = await postOgImage(post);
  return svgBufferToPngBuffer(svg);
}

export async function generateOgImageForSite() {
  const svg = await siteOgImage();
  return svgBufferToPngBuffer(svg);
}
