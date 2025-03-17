// app/api/users/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { userIds } = await request.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid or missing userIds" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("users")
      .select("id, name, email")
      .in("id", userIds);

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
