// app/api/order-feedback/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("order_feedback")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching feedback details:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const body = await request.json();

    // Update the feedback
    const { data, error } = await supabase
      .from("order_feedback")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select();

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("Error updating feedback:", error);
    return NextResponse.json(
      { error: "Failed to update feedback" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    // Soft delete - update the status and deleted_at timestamp
    const { data, error } = await supabase
      .from("order_feedback")
      .update({
        status: "deleted",
        deleted_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return NextResponse.json(
      { error: "Failed to delete feedback" },
      { status: 500 }
    );
  }
}
