import { flag } from "flags/next";
import { vercelAdapter } from "@flags-sdk/vercel";

/**
 *>> S T E P S:
 *
 * >> STEP-1
 * Add the name of the flag to the 'FEATURE_FLAGS_ENUM'('flags.enum.ts') -> this gives autocompletion. Use consistent names.
 * This also servs as the variable name(below) in 'page.tsx'
 *
 ** ex:
 **     export enum FEATURE_FLAGS_ENUM {
 **      bgversion = "bgversion",
 **    }
 *
 * >> STEP-2
 * Add the flag key and adapter to 'flags.ts' (this file)
 * Key must exactly match the flag name on the Vercel servers
 **  export const ff_bg_version = flag({
 **        key: "ff_bg_version_flag",
 **        adapter: vercelAdapter(),
 **    });
 *
 * >> STEP-3
 * Import the flag from 'flag.ts' file and retrieve the flag value from Vercel servers in 'page.tsx':
 ** ex:
 **     import { ff_bg_version } from "@/flags/flags";
 **     const bgversion = await ff_bg_version();
 *
 *  >> STEP-4
 * Add the retrieved value to the 'FEATURE_FLAGS' dictionary in 'page.tsx' - this is sent as props
 ** ex:
 * *FEATURE_FLAGS[FEATURE_FLAGS_ENUM.bgversion] = bgversion;
 *
 * Here:
 * RHS: retrieved flag vaue from Vercel servers
 * LHS: FEATURE_FLAGS dictionary key - same as added in the FEATURE_FLAGS_ENUM.
 *
 * >> STEP-5
 * Send the FEATURE_FLAGS dictinary created above to the AppShell('app-shell.component.tsx')
 *
 ** ex:
 **   <AppShell FEATURE_FLAGS={FEATURE_FLAGS} />
 *
 * >> STEP-6
 * Verify that we have the feature flags accessible inside components via FEATURE_FLAGS sent as props.
 *
 ** ex:
 ** export default function AppShell({ FEATURE_FLAGS }: AppShellProps)
 **    {
 **    ...AppShell component...
 *     ...VERIFY HERE...
 **     console.log(FEATURE_FLAGS[FEATURE_FLAGS_ENUM.bgversion])
 **    }
 *
 *  >> STEP-7
 * Store the flag value in a variable and it is ready to use.
 *
 * ex:
 ** const backgroundVersion = FEATURE_FLAGS[FEATURE_FLAGS_ENUM.bgversion];
 * ......................................................................
 */

export const ffScrollBehindUploadArea = flag({
  key: "ff-scroll-behind-upload-area",
  adapter: vercelAdapter(),
});

export const ff_bg_version = flag({
  key: "ff_bg_version_flag",
  adapter: vercelAdapter(),
});
