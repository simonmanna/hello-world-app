// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();

    // Fetch all orders
    const { data: orders, error } = await supabase.from("orders").select("*");
    // .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch orders from database" },
        { status: 500 }
      );
    }

    if (!orders) {
      return NextResponse.json([], { status: 200 });
    }

    // Process each order's order_items field
    const processedOrders = orders.map((order) => {
      let orderItems = order.order_items;

      // If order_items is a string, parse it
      if (typeof orderItems === "string") {
        try {
          orderItems = JSON.parse(orderItems);
        } catch (e) {
          console.error(`Error parsing order_items for order ${order.id}:`, e);
          orderItems = [];
        }
      }

      // Ensure order_items is an array
      if (!Array.isArray(orderItems)) {
        orderItems = [];
      }

      return {
        ...order,
        order_items: orderItems,
      };
    });

    return NextResponse.json(processedOrders, { status: 200 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders data" },
      { status: 500 }
    );
  }
}
