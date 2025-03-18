// app/api/order-feedback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("order_feedback")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching order feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch order feedback" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const body = await request.json();

    // Validate required fields
    const { order_id, user_id, rating } = body;
    if (!order_id || !user_id || rating === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert the new feedback
    const { data, error } = await supabase
      .from("order_feedback")
      .insert([body])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json(data[0]);
  } catch (error: any) {
    console.error("Error creating order feedback:", error);

    // Handle unique constraint violation
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Feedback already exists for this order and user" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create order feedback" },
      { status: 500 }
    );
  }
}
