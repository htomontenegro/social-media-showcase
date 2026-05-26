import { z } from "zod";
import { isInstagramUrl } from "@/lib/enrich/instagram";

export const instagramUrlSchema = z
  .string()
  .url()
  .refine((u) => {
    try {
      const parsed = new URL(u);
      return ["http:", "https:"].includes(parsed.protocol) && isInstagramUrl(u);
    } catch {
      return false;
    }
  }, "Must be a valid Instagram URL (instagram.com or instagr.am)");

export const importBatchSchema = z.object({
  urls: z.array(instagramUrlSchema).min(1).max(50),
});

export const importSingleSchema = z.object({
  url: instagramUrlSchema,
});
