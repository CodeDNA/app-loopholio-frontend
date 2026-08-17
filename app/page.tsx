import MainPage from "@/components/main-page";

export const FEATURE_FLAGS: Record<string, any> = {};

export default async function Page() {
  return (
    <main>
      <MainPage FEATURE_FLAGS={FEATURE_FLAGS} />
    </main>
  );
}
