// File: app/api/payments/route.ts - API route handler for payments
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "@/types/supabase";

interface PaymentRequestBody {
  payment: {
    customer_id: string;
    amount_paid: number;
    payment_method: string;
    payment_status: string;
    transaction_id?: string;
    notes?: string;
  };
  paymentItems: Array<{
    invoice_id: string;
    amount: number;
    notes?: string;
  }>;
}

interface PaginationResponse {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const supabase = createRouteHandlerClient<Database>({ cookies });

  const { data: session } = await supabase.auth.getSession();
  if (!session?.session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get query params for pagination/filtering
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const customerId = searchParams.get("customerId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");

    // Calculate the range based on pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Build query
    let query = supabase
      .from("payments")
      .select(
        `
        *,
        customers(name),
        payment_items(
          id,
          amount,
          invoice_id,
          invoices(invoice_number, total_amount)
        )
      `
      )
      .order("payment_date", { ascending: false })
      .range(from, to);

    // Apply filters if provided
    if (customerId) query = query.eq("customer_id", customerId);
    if (startDate) query = query.gte("payment_date", startDate);
    if (endDate) query = query.lte("payment_date", endDate);
    if (status) query = query.eq("payment_status", status);

    // Execute query
    const { data: payments, error, count } = await query;

    if (error) throw error;

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from("payments")
      .select("*", { count: "exact", head: true });

    const paginationResponse: PaginationResponse = {
      total: totalCount || 0,
      page,
      pageSize,
      totalPages: Math.ceil((totalCount || 0) / pageSize),
    };

    return NextResponse.json({
      payments,
      pagination: paginationResponse,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  const { data: session } = await supabase.auth.getSession();
  if (!session?.session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { payment, paymentItems }: PaymentRequestBody = await request.json();

    // Generate a unique payment number (e.g., PAY-2023-00001)
    const date = new Date();
    const yearStr = date.getFullYear();

    // Get count of payments this year to create sequence number
    const { count } = await supabase
      .from("payments")
      .select("*", { count: "exact", head: true })
      .gte("payment_date", `${yearStr}-01-01`)
      .lte("payment_date", `${yearStr}-12-31`);

    const sequenceNum = String(count ? count + 1 : 1).padStart(5, "0");
    const paymentWithNumber = {
      ...payment,
      payment_number: `PAY-${yearStr}-${sequenceNum}`,
    };

    // Insert payment record
    const { data: paymentData, error: paymentError } = await supabase
      .from("payments")
      .insert(paymentWithNumber)
      .select();

    if (paymentError) throw paymentError;
    if (!paymentData || paymentData.length === 0) {
      throw new Error("Failed to create payment record");
    }

    // Prepare payment items with the new payment ID
    const paymentItemsWithId = paymentItems.map((item) => ({
      ...item,
      payment_id: paymentData[0].id,
    }));

    // Insert payment items
    const { error: itemsError } = await supabase
      .from("payment_items")
      .insert(paymentItemsWithId);

    if (itemsError) throw itemsError;

    return NextResponse.json({
      success: true,
      payment: paymentData[0],
      message: "Payment recorded successfully",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
