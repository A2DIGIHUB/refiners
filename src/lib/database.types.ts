export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      collections: {
        Row: {
          id: string
          name: string
          description: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      media_collections: {
        Row: {
          media_id: string
          collection_id: string
          added_at: string
        }
        Insert: {
          media_id: string
          collection_id: string
          added_at?: string
        }
        Update: {
          media_id?: string
          collection_id?: string
          added_at?: string
        }
      }
      media_files: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          bucket: string
          path: string
          size: number
          mime_type: string
          metadata: Json
          user_id: string
          public: boolean
          title: string | null
          description: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          bucket: string
          path: string
          size: number
          mime_type: string
          metadata?: Json
          user_id: string
          public?: boolean
          title?: string | null
          description?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          bucket?: string
          path?: string
          size?: number
          mime_type?: string
          metadata?: Json
          user_id?: string
          public?: boolean
          title?: string | null
          description?: string | null
        }
      }
      media_tags: {
        Row: {
          media_id: string
          tag: string
          added_at: string
        }
        Insert: {
          media_id: string
          tag: string
          added_at?: string
        }
        Update: {
          media_id?: string
          tag?: string
          added_at?: string
        }
      }
    }
  }
}