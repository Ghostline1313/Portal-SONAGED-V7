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
      collection_points: {
        Row: {
          id: string
          name: string
          type: 'container' | 'bin' | 'center'
          latitude: number
          longitude: number
          commune_id: string
          capacity_kg: number
          waste_type: 'general' | 'recyclable' | 'organic' | 'hazardous'
          status: 'active' | 'inactive' | 'maintenance'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'container' | 'bin' | 'center'
          latitude: number
          longitude: number
          commune_id: string
          capacity_kg: number
          waste_type: 'general' | 'recyclable' | 'organic' | 'hazardous'
          status?: 'active' | 'inactive' | 'maintenance'
        }
        Update: Partial<Database['public']['Tables']['collection_points']['Insert']>
      }
      sweeping_routes: {
        Row: {
          id: string
          name: string
          code: string | null
          commune_id: string
          shift: 'matin' | 'soir'
          length_meters: number
          estimated_duration_minutes: number
          status: 'active' | 'inactive' | 'maintenance'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code?: string
          commune_id: string
          shift: 'matin' | 'soir'
          length_meters: number
          estimated_duration_minutes: number
          status?: 'active' | 'inactive' | 'maintenance'
        }
        Update: Partial<Database['public']['Tables']['sweeping_routes']['Insert']>
      }
      urban_furniture: {
        Row: {
          id: string
          type: 'PRN' | 'BAC_RUE' | 'POINT_PROPRE'
          name: string
          location: string
          latitude: number
          longitude: number
          commune_id: string
          install_date: string
          last_maintenance_date: string | null
          capacity_kg: number
          status: 'good' | 'needs-maintenance' | 'damaged'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'PRN' | 'BAC_RUE' | 'POINT_PROPRE'
          name: string
          location: string
          latitude: number
          longitude: number
          commune_id: string
          install_date: string
          last_maintenance_date?: string
          capacity_kg: number
          status?: 'good' | 'needs-maintenance' | 'damaged'
        }
        Update: Partial<Database['public']['Tables']['urban_furniture']['Insert']>
      }
    }
  }
}