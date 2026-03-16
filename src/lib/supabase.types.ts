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
          status: "draft" | "review" | "published";
          deleted_at: string | null;
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
          status?: "draft" | "review" | "published";
          deleted_at?: string | null;
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
          status?: "draft" | "review" | "published";
          deleted_at?: string | null;
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
          status: "draft" | "review" | "published";
          deleted_at: string | null;
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
          status?: "draft" | "review" | "published";
          deleted_at?: string | null;
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
          status?: "draft" | "review" | "published";
          deleted_at?: string | null;
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
          status: "draft" | "review" | "published";
          deleted_at: string | null;
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
          status?: "draft" | "review" | "published";
          deleted_at?: string | null;
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
          status?: "draft" | "review" | "published";
          deleted_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      educations: {
        Row: {
          id: string;
          degree: string;
          institution: string;
          location: string;
          period: string;
          description: string;
          description_en: string | null;
          status: "draft" | "review" | "published";
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          degree: string;
          institution: string;
          location: string;
          period: string;
          description: string;
          description_en?: string | null;
          status?: "draft" | "review" | "published";
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          degree?: string;
          institution?: string;
          location?: string;
          period?: string;
          description?: string;
          description_en?: string | null;
          status?: "draft" | "review" | "published";
          deleted_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      dashboard_users: {
        Row: {
          id: string;
          email: string;
          role: "admin" | "editor";
          password_hash: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role?: "admin" | "editor";
          password_hash: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          role?: "admin" | "editor";
          password_hash?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      dashboard_audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          user_email: string | null;
          user_role: string | null;
          action: string;
          resource: string;
          resource_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          user_email?: string | null;
          user_role?: string | null;
          action: string;
          resource: string;
          resource_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          user_id?: string | null;
          user_email?: string | null;
          user_role?: string | null;
          action?: string;
          resource?: string;
          resource_id?: string | null;
          metadata?: Json;
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
