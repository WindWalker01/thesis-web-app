import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function TestPage() {
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase.from("test").select("*");

  return (
    <main>
      <h1>Hello Supabase 👋</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
