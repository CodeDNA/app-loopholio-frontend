import { flag } from "flags/next";
import { vercelAdapter } from "@flags-sdk/vercel";

/** RULES
 * Retrue the flag using:
 * const flag = await flag();
 *
 * Add the retrieved value to the 'FEATURE_FLAGS' dictionary - this is sent as props
 * Add the name of the flag to the 'FEATURE_FLAGS_ENUM' -> this gives autocompletion. Use consistent names.
 * 
 * IMPORTING IN A COMPONENT:
 * example:
 * 
 * const importflags = async () => {
    const feature_scroll_behind_UploadArea = await ffScrollBehindUploadArea();
    FEATURE_FLAGS[FEATURE_FLAGS_ENUM.feature_scroll_behind_UploadArea] =
      feature_scroll_behind_UploadArea;
  };
 */

export const ffScrollBehindUploadArea = flag({
  key: "ff-scroll-behind-upload-area",
  adapter: vercelAdapter(),
});
