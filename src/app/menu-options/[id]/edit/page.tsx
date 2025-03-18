// app/menu-options/[id]/edit/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import MenuOptionForm from "../../../components/MenuOptionForm";
import { supabase, MenuOption } from "../../../lib/supabaseClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { data: menuOption } = await supabase
    .from("menu_options")
    .select("name")
    .eq("id", params.id)
    .single();

  return {
    title: menuOption ? `Edit ${menuOption.name}` : "Edit Menu Option",
  };
}

export default async function EditMenuOptionPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: menuOption, error } = await supabase
    .from("menu_options")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !menuOption) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Edit Menu Option</h1>
          <p className="text-blue-100 text-sm">
            Customize your menu option details
          </p>
        </div>

        <div className="p-6">
          <MenuOptionForm
            menuOption={menuOption as MenuOption}
            id={params.id}
          />
        </div>
      </div>
    </div>
  );
}
