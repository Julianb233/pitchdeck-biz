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
          email_verified: boolean;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          created_at?: string;
          stripe_customer_id?: string | null;
          email_verified?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          created_at?: string;
          stripe_customer_id?: string | null;
          email_verified?: boolean;
        };
        Relationships: [];
      };
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
        Relationships: [
          {
            foreignKeyName: "analyses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "decks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "decks_analysis_id_fkey";
            columns: ["analysis_id"];
            isOneToOne: false;
            referencedRelation: "analyses";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_deck_id_fkey";
            columns: ["deck_id"];
            isOneToOne: false;
            referencedRelation: "decks";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
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
          brand_colors: Json;
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
          brand_colors?: Json;
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
          brand_colors?: Json;
          tokens_used?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assets_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assets_subscription_id_fkey";
            columns: ["subscription_id"];
            isOneToOne: false;
            referencedRelation: "subscriptions";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "token_usage_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "token_usage_subscription_id_fkey";
            columns: ["subscription_id"];
            isOneToOne: false;
            referencedRelation: "subscriptions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "token_usage_asset_id_fkey";
            columns: ["asset_id"];
            isOneToOne: false;
            referencedRelation: "assets";
            referencedColumns: ["id"];
          },
        ];
      };
      verification_tokens: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          type: string;
          email: string;
          expires_at: string;
          used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          type?: string;
          email?: string;
          expires_at: string;
          used_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token?: string;
          type?: string;
          email?: string;
          expires_at?: string;
          used_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "verification_tokens_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
