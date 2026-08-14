import { flag } from "flags/next";
import { vercelAdapter } from "@flags-sdk/vercel";

export const ffScrollBehindUploadArea = flag({
  key: "ff-scroll-behind-upload-area",
  adapter: vercelAdapter(),
});
