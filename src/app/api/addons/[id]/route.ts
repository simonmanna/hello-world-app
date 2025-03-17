// app/api/addons/[id]/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  const { data, error } = await supabase
    .from("addons")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Addon not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const updates = await request.json();

  const { data, error } = await supabase
    .from("addons")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data[0]);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  const { error } = await supabase.from("addons").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Addon deleted successfully" });
}
