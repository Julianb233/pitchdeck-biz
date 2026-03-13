import { createClient } from "./server";
import type { Json } from "./types";

type DeckRow = {
  id: string;
  user_id: string;
  analysis_id: string | null;
  title: string;
  slides: Json;
  sell_sheet: Json | null;
  one_pager: Json | null;
  brand_kit: Json | null;
  status: string;
  created_at: string;
};

export async function saveDeck(
  userId: string,
  title: string,
  analysisData: Json,
  slides: Json
): Promise<DeckRow | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("decks")
      .insert({
        user_id: userId,
        title,
        slides,
        status: "analysis_complete",
      })
      .select()
      .single();

    if (error) {
      console.error("[decks] saveDeck error:", error.message);
      return null;
    }
    return data as DeckRow;
  } catch (err) {
    console.error("[decks] saveDeck exception:", err);
    return null;
  }
}

export async function getDeck(deckId: string): Promise<DeckRow | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("decks")
      .select("*")
      .eq("id", deckId)
      .single();

    if (error) {
      console.error("[decks] getDeck error:", error.message);
      return null;
    }
    return data as DeckRow;
  } catch (err) {
    console.error("[decks] getDeck exception:", err);
    return null;
  }
}

export async function getUserDecks(userId: string): Promise<DeckRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("decks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[decks] getUserDecks error:", error.message);
      return [];
    }
    return (data as DeckRow[]) ?? [];
  } catch (err) {
    console.error("[decks] getUserDecks exception:", err);
    return [];
  }
}

export async function updateDeckContent(
  deckId: string,
  content: {
    slides: Json;
    sell_sheet?: Json;
    one_pager?: Json;
    brand_kit?: Json;
  }
): Promise<DeckRow | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("decks")
      .update({
        slides: content.slides,
        sell_sheet: content.sell_sheet ?? null,
        one_pager: content.one_pager ?? null,
        brand_kit: content.brand_kit ?? null,
      })
      .eq("id", deckId)
      .select()
      .single();

    if (error) {
      console.error("[decks] updateDeckContent error:", error.message);
      return null;
    }
    return data as DeckRow;
  } catch (err) {
    console.error("[decks] updateDeckContent exception:", err);
    return null;
  }
}

export async function updateDeckStatus(
  deckId: string,
  status: string
): Promise<DeckRow | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("decks")
      .update({ status })
      .eq("id", deckId)
      .select()
      .single();

    if (error) {
      console.error("[decks] updateDeckStatus error:", error.message);
      return null;
    }
    return data as DeckRow;
  } catch (err) {
    console.error("[decks] updateDeckStatus exception:", err);
    return null;
  }
}
