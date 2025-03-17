// app/menu-options/page.tsx
import { supabase, MenuOption } from "@/lib/supabaseClient";
import MenuOptionList from "@/components/MenuOptionList";

export const dynamic = "force-dynamic";

export default async function MenuOptionsPage() {
  const { data: menuOptions, error } = await supabase
    .from("menu_options")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching menu options:", error);
    return <div>Error loading menu options. Please try again later.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Menu Options</h1>
      <MenuOptionList initialMenuOptions={menuOptions as MenuOption[]} />
    </div>
  );
}
