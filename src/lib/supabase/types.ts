export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      analyses: {
        Row: {
          id: string;
          user_id: string;
          business_name: string;
          analysis_data: Json;
          files_uploaded: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_name: string;
          analysis_data?: Json;
          files_uploaded?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_name?: string;
          analysis_data?: Json;
          files_uploaded?: Json;
          created_at?: string;
        };
      };
      decks: {
        Row: {
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
        Insert: {
          id?: string;
          user_id: string;
          analysis_id?: string | null;
          title: string;
          slides?: Json;
          sell_sheet?: Json | null;
          one_pager?: Json | null;
          brand_kit?: Json | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          analysis_id?: string | null;
          title?: string;
          slides?: Json;
          sell_sheet?: Json | null;
          one_pager?: Json | null;
          brand_kit?: Json | null;
          status?: string;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          deck_id: string;
          stripe_session_id: string | null;
          amount_cents: number;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          deck_id: string;
          stripe_session_id?: string | null;
          amount_cents: number;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          deck_id?: string;
          stripe_session_id?: string | null;
          amount_cents?: number;
          status?: string;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_subscription_id: string;
          stripe_customer_id: string;
          status: string;
          token_balance: number;
          tokens_allocated: number;
          current_period_start: string;
          current_period_end: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_subscription_id: string;
          stripe_customer_id: string;
          status?: string;
          token_balance?: number;
          tokens_allocated?: number;
          current_period_start: string;
          current_period_end: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_subscription_id?: string;
          stripe_customer_id?: string;
          status?: string;
          token_balance?: number;
          tokens_allocated?: number;
          current_period_start?: string;
          current_period_end?: string;
          created_at?: string;
        };
      };
      assets: {
        Row: {
          id: string;
          user_id: string;
          subscription_id: string | null;
          asset_type: string;
          template_name: string | null;
          prompt: string | null;
          image_data: string | null;
          tokens_used: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subscription_id?: string | null;
          asset_type: string;
          template_name?: string | null;
          prompt?: string | null;
          image_data?: string | null;
          tokens_used?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subscription_id?: string | null;
          asset_type?: string;
          template_name?: string | null;
          prompt?: string | null;
          image_data?: string | null;
          tokens_used?: number;
          created_at?: string;
        };
      };
      token_usage: {
        Row: {
          id: string;
          user_id: string;
          subscription_id: string | null;
          asset_id: string | null;
          tokens_used: number;
          action: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subscription_id?: string | null;
          asset_id?: string | null;
          tokens_used: number;
          action: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subscription_id?: string | null;
          asset_id?: string | null;
          tokens_used?: number;
          action?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
