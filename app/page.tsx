import MainPage from "@/components/main-page";
import { ffScrollBehindUploadArea } from "@/flags/flags";
import { FEATURE_FLAGS_ENUM } from "@/flags/flags.enum";

export const FEATURE_FLAGS: Record<string, any> = {};

/** RULES
 * Retrue the flag using:
 * const flag = await flag();
 *
 * Add the retrieved value to the 'FEATURE_FLAGS' dictionary - this is sent as props
 * Add the name of the flag to the 'FEATURE_FLAGS_ENUM' -> this gives autocompletion. Use consistent names.
 */
export default async function Page() {
  const importflags = async () => {
    const feature_scroll_behind_UploadArea = await ffScrollBehindUploadArea();
    FEATURE_FLAGS[FEATURE_FLAGS_ENUM.feature_scroll_behind_UploadArea] =
      feature_scroll_behind_UploadArea;
  };
  importflags();

  return (
    <main>
      <MainPage FEATURE_FLAGS={FEATURE_FLAGS} />
    </main>
  );
}
