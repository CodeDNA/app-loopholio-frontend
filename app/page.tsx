import { AppShell } from "@/components/app-shell.component";
import { FEATURE_FLAGS_ENUM } from "@/lib/flags/flags.enum";
import { ff_bg_version } from "@/lib/flags/flags";

const FEATURE_FLAGS: Record<string, any> = {};
export default async function Page() {
  const bgversion = await ff_bg_version();
  FEATURE_FLAGS[FEATURE_FLAGS_ENUM.bgversion] = bgversion;
  return (
    <main>
      <AppShell FEATURE_FLAGS={FEATURE_FLAGS} />
    </main>
  );
}
