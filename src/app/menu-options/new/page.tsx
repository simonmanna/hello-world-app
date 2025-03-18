// app/menu-options/new/page.tsx
import { Metadata } from "next";
import MenuOptionForm from "../../components/MenuOptionForm";

export const metadata: Metadata = {
  title: "Create New Menu Option",
};

export default function NewMenuOptionPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Menu Option</h1>
      <MenuOptionForm />
    </div>
  );
}
