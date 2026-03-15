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
      experiences: {
        Row: {
          id: string;
          role: string;
          company: string;
          location: string;
          period: string;
          type: string;
          description: string;
          description_en: string | null;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          role: string;
          company: string;
          location: string;
          period: string;
          type: string;
          description: string;
          description_en?: string | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          role?: string;
          company?: string;
          location?: string;
          period?: string;
          type?: string;
          description?: string;
          description_en?: string | null;
          tags?: string[];
          updated_at?: string;
        };
        Relationships: [];
      };
      certifications: {
        Row: {
          id: string;
          name: string;
          issuer: string;
          date: string;
          credential_id: string;
          badge: string;
          gradient: string;
          hover_border: string;
          href: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          issuer: string;
          date: string;
          credential_id: string;
          badge?: string;
          gradient?: string;
          hover_border?: string;
          href?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          issuer?: string;
          date?: string;
          credential_id?: string;
          badge?: string;
          gradient?: string;
          hover_border?: string;
          href?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          title: string;
          title_en: string | null;
          description: string;
          description_en: string | null;
          tags: string[];
          href: string | null;
          repo: string | null;
          gradient: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          title_en?: string | null;
          description: string;
          description_en?: string | null;
          tags?: string[];
          href?: string | null;
          repo?: string | null;
          gradient?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          title_en?: string | null;
          description?: string;
          description_en?: string | null;
          tags?: string[];
          href?: string | null;
          repo?: string | null;
          gradient?: string;
          updated_at?: string;
        };
        Relationships: [];
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
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
