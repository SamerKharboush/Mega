import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Type definitions for Supabase tables
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
      slides: {
        Row: {
          id: string
          user_id: string
          filename: string
          storage_path: string
          format: 'svs' | 'ndpi' | 'tiff' | 'mrxs' | 'scn'
          status: 'uploaded' | 'processing' | 'ready' | 'error'
          tile_count: number | null
          dzi_path: string | null
          width_px: number | null
          height_px: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          filename: string
          storage_path: string
          format?: 'svs' | 'ndpi' | 'tiff' | 'mrxs' | 'scn'
          status?: 'uploaded' | 'processing' | 'ready' | 'error'
          tile_count?: number | null
          dzi_path?: string | null
          width_px?: number | null
          height_px?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          filename?: string
          storage_path?: string
          format?: 'svs' | 'ndpi' | 'tiff' | 'mrxs' | 'scn'
          status?: 'uploaded' | 'processing' | 'ready' | 'error'
          tile_count?: number | null
          dzi_path?: string | null
          width_px?: number | null
          height_px?: number | null
          created_at?: string
        }
      }
      analyses: {
        Row: {
          id: string
          slide_id: string
          user_id: string
          task: 'subtype' | 'mutation' | 'prognosis' | 'ihc' | 'tme'
          status: 'queued' | 'running' | 'done' | 'error'
          model_version: string | null
          results: Json | null
          heatmap_path: string | null
          report_path: string | null
          duration_ms: number | null
          created_at: string
        }
        Insert: {
          id?: string
          slide_id: string
          user_id: string
          task: 'subtype' | 'mutation' | 'prognosis' | 'ihc' | 'tme'
          status?: 'queued' | 'running' | 'done' | 'error'
          model_version?: string | null
          results?: Json | null
          heatmap_path?: string | null
          report_path?: string | null
          duration_ms?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          slide_id?: string
          user_id?: string
          task?: 'subtype' | 'mutation' | 'prognosis' | 'ihc' | 'tme'
          status?: 'queued' | 'running' | 'done' | 'error'
          model_version?: string | null
          results?: Json | null
          heatmap_path?: string | null
          report_path?: string | null
          duration_ms?: number | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: 'free' | 'pro' | 'enterprise'
          slides_used_this_month: number
          slides_limit: number
          current_period_end: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: 'free' | 'pro' | 'enterprise'
          slides_used_this_month?: number
          slides_limit?: number
          current_period_end?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: 'free' | 'pro' | 'enterprise'
          slides_used_this_month?: number
          slides_limit?: number
          current_period_end?: string | null
          updated_at?: string
        }
      }
    }
  }
}