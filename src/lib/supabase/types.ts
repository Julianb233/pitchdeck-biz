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
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          created_at: string;
          stripe_customer_id: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          created_at?: string;
          stripe_customer_id?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          created_at?: string;
          stripe_customer_id?: string | null;
        };
      };
      decks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          business_analysis: Json | null;
          deck_content: Json | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          business_analysis?: Json | null;
          deck_content?: Json | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          business_analysis?: Json | null;
          deck_content?: Json | null;
          status?: string;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_subscription_id: string;
          status: string;
          current_period_start: string;
          current_period_end: string;
          token_balance: number;
          tokens_used: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_subscription_id: string;
          status?: string;
          current_period_start: string;
          current_period_end: string;
          token_balance?: number;
          tokens_used?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_subscription_id?: string;
          status?: string;
          current_period_start?: string;
          current_period_end?: string;
          token_balance?: number;
          tokens_used?: number;
        };
      };
      assets: {
        Row: {
          id: string;
          user_id: string;
          subscription_id: string | null;
          type: string;
          template: string | null;
          prompt: string | null;
          image_url: string | null;
          tokens_cost: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subscription_id?: string | null;
          type: string;
          template?: string | null;
          prompt?: string | null;
          image_url?: string | null;
          tokens_cost?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subscription_id?: string | null;
          type?: string;
          template?: string | null;
          prompt?: string | null;
          image_url?: string | null;
          tokens_cost?: number;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          deck_id: string;
          stripe_payment_intent_id: string | null;
          amount: number;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          deck_id: string;
          stripe_payment_intent_id?: string | null;
          amount: number;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          deck_id?: string;
          stripe_payment_intent_id?: string | null;
          amount?: number;
          status?: string;
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
