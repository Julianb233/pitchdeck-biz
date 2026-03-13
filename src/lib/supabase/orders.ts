import { createClient } from "./server";

export type OrderRow = {
  id: string;
  user_id: string;
  deck_id: string;
  stripe_session_id: string | null;
  amount_cents: number;
  status: string;
  created_at: string;
};

export async function createOrder(
  userId: string,
  deckId: string,
  amountCents: number
): Promise<OrderRow | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        deck_id: deckId,
        amount_cents: amountCents,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("[orders] createOrder error:", error.message);
      return null;
    }
    return data as OrderRow;
  } catch (err) {
    console.error("[orders] createOrder exception:", err);
    return null;
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  stripeSessionId?: string
): Promise<OrderRow | null> {
  try {
    const supabase = await createClient();
    const updateData: Record<string, unknown> = { status };
    if (stripeSessionId) {
      updateData.stripe_session_id = stripeSessionId;
    }

    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error("[orders] updateOrderStatus error:", error.message);
      return null;
    }
    return data as OrderRow;
  } catch (err) {
    console.error("[orders] updateOrderStatus exception:", err);
    return null;
  }
}

export async function getUserOrders(userId: string): Promise<OrderRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[orders] getUserOrders error:", error.message);
      return [];
    }
    return (data as OrderRow[]) ?? [];
  } catch (err) {
    console.error("[orders] getUserOrders exception:", err);
    return [];
  }
}

export async function getOrder(orderId: string): Promise<OrderRow | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error) {
      console.error("[orders] getOrder error:", error.message);
      return null;
    }
    return data as OrderRow;
  } catch (err) {
    console.error("[orders] getOrder exception:", err);
    return null;
  }
}
