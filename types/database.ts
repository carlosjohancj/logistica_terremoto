// AUTO-GENERATED from the live Supabase schema (PostgREST OpenAPI introspection).
// Regenerate by re-running the introspection + gen-types script rather than
// hand-editing — see supabase/migrations/ for the source-of-truth DDL.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          phone: string | null
          whatsapp: string | null
          role: string
          languages: Json | null
          verified: boolean | null
          created_at: string | null
          updated_at: string | null
          volunteer_type: string | null
          age: number | null
        }
        Insert: {
          id: string
          name?: string | null
          phone?: string | null
          whatsapp?: string | null
          role?: string
          languages?: Json | null
          verified?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          volunteer_type?: string | null
          age?: number | null
        }
        Update: {
          id?: string
          name?: string | null
          phone?: string | null
          whatsapp?: string | null
          role?: string
          languages?: Json | null
          verified?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          volunteer_type?: string | null
          age?: number | null
        }
        Relationships: []
      }
      estados: {
        Row: {
          id: string
          name: string
          capital: string | null
          municipios: Json | null
          lat: number | null
          lng: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          capital?: string | null
          municipios?: Json | null
          lat?: number | null
          lng?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          capital?: string | null
          municipios?: Json | null
          lat?: number | null
          lng?: number | null
          created_at?: string | null
        }
        Relationships: []
      }
      donation_settings: {
        Row: {
          id: string
          method: string
          label: string
          details: Json
          sort_order: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          method: string
          label: string
          details: Json
          sort_order?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          method?: string
          label?: string
          details?: Json
          sort_order?: number | null
          created_at?: string | null
        }
        Relationships: []
      }
      travel_requests: {
        Row: {
          id: string
          user_id: string | null
          has_destination: boolean | null
          origin_state: string
          origin_municipality: string
          origin_city: string
          destination_state: string | null
          destination_municipality: string | null
          destination_city: string | null
          people_to_move: number
          people_to_house: number | null
          children_count: number | null
          adults_count: number | null
          housing_destruction: string
          members: Json | null
          registrant_type: string
          registrant_relation: string | null
          status: string
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          has_destination?: boolean | null
          origin_state: string
          origin_municipality: string
          origin_city: string
          destination_state?: string | null
          destination_municipality?: string | null
          destination_city?: string | null
          people_to_move: number
          people_to_house?: number | null
          children_count?: number | null
          adults_count?: number | null
          housing_destruction: string
          members?: Json | null
          registrant_type: string
          registrant_relation?: string | null
          status?: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          has_destination?: boolean | null
          origin_state?: string
          origin_municipality?: string
          origin_city?: string
          destination_state?: string | null
          destination_municipality?: string | null
          destination_city?: string | null
          people_to_move?: number
          people_to_house?: number | null
          children_count?: number | null
          adults_count?: number | null
          housing_destruction?: string
          members?: Json | null
          registrant_type?: string
          registrant_relation?: string | null
          status?: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "travel_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_offers: {
        Row: {
          id: string
          user_id: string | null
          vehicle_type: string
          capacity: number
          origin_state: string
          origin_municipality: string
          origin_city: string
          destination_state: string
          destination_municipality: string
          destination_city: string
          available_from: string | null
          available_until: string | null
          flexible_date: boolean | null
          needs_gas_donation: boolean | null
          gas_donation_amount: number | null
          accepts_passengers: boolean | null
          accepts_cargo: boolean | null
          notes: string | null
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          vehicle_type: string
          capacity: number
          origin_state: string
          origin_municipality: string
          origin_city: string
          destination_state: string
          destination_municipality: string
          destination_city: string
          available_from?: string | null
          available_until?: string | null
          flexible_date?: boolean | null
          needs_gas_donation?: boolean | null
          gas_donation_amount?: number | null
          accepts_passengers?: boolean | null
          accepts_cargo?: boolean | null
          notes?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          vehicle_type?: string
          capacity?: number
          origin_state?: string
          origin_municipality?: string
          origin_city?: string
          destination_state?: string
          destination_municipality?: string
          destination_city?: string
          available_from?: string | null
          available_until?: string | null
          flexible_date?: boolean | null
          needs_gas_donation?: boolean | null
          gas_donation_amount?: number | null
          accepts_passengers?: boolean | null
          accepts_cargo?: boolean | null
          notes?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_offers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      housing_offers: {
        Row: {
          id: string
          user_id: string | null
          state: string
          municipality: string
          city: string
          address: string | null
          capacity: number
          max_stay_days: number
          accepts_children: boolean | null
          accepts_adults: boolean | null
          accepts_families: boolean | null
          has_furniture: boolean | null
          has_kitchen: boolean | null
          has_bathroom: boolean | null
          notes: string | null
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          state: string
          municipality: string
          city: string
          address?: string | null
          capacity: number
          max_stay_days: number
          accepts_children?: boolean | null
          accepts_adults?: boolean | null
          accepts_families?: boolean | null
          has_furniture?: boolean | null
          has_kitchen?: boolean | null
          has_bathroom?: boolean | null
          notes?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          state?: string
          municipality?: string
          city?: string
          address?: string | null
          capacity?: number
          max_stay_days?: number
          accepts_children?: boolean | null
          accepts_adults?: boolean | null
          accepts_families?: boolean | null
          has_furniture?: boolean | null
          has_kitchen?: boolean | null
          has_bathroom?: boolean | null
          notes?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "housing_offers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          id: string
          user_id: string | null
          donor_name: string | null
          donor_contact: string | null
          amount: number
          currency: string
          payment_method: string
          target_type: string
          message: string | null
          confirmed: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          donor_name?: string | null
          donor_contact?: string | null
          amount: number
          currency: string
          payment_method: string
          target_type: string
          message?: string | null
          confirmed?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          donor_name?: string | null
          donor_contact?: string | null
          amount?: number
          currency?: string
          payment_method?: string
          target_type?: string
          message?: string | null
          confirmed?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          id: string
          travel_request_id: string | null
          transport_offer_id: string | null
          housing_offer_id: string | null
          status: string
          notes: string | null
          created_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          travel_request_id?: string | null
          transport_offer_id?: string | null
          housing_offer_id?: string | null
          status?: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          travel_request_id?: string | null
          transport_offer_id?: string | null
          housing_offer_id?: string | null
          status?: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_travel_request_id_fkey"
            columns: ["travel_request_id"]
            isOneToOne: false
            referencedRelation: "travel_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_transport_offer_id_fkey"
            columns: ["transport_offer_id"]
            isOneToOne: false
            referencedRelation: "transport_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_housing_offer_id_fkey"
            columns: ["housing_offer_id"]
            isOneToOne: false
            referencedRelation: "housing_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          id: string
          match_id: string | null
          from_user_id: string | null
          to_user_id: string | null
          rating: number
          comment: string | null
          category: string
          created_at: string | null
        }
        Insert: {
          id?: string
          match_id?: string | null
          from_user_id?: string | null
          to_user_id?: string | null
          rating: number
          comment?: string | null
          category: string
          created_at?: string | null
        }
        Update: {
          id?: string
          match_id?: string | null
          from_user_id?: string | null
          to_user_id?: string | null
          rating?: number
          comment?: string | null
          category?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          id: string
          user_id: string | null
          name: string
          rif: string | null
          sector: string | null
          state: string | null
          municipality: string | null
          city: string | null
          address: string | null
          description: string | null
          contact_name: string
          contact_phone: string | null
          contact_email: string
          website: string | null
          verified: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          rif?: string | null
          sector?: string | null
          state?: string | null
          municipality?: string | null
          city?: string | null
          address?: string | null
          description?: string | null
          contact_name: string
          contact_phone?: string | null
          contact_email: string
          website?: string | null
          verified?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          rif?: string | null
          sector?: string | null
          state?: string | null
          municipality?: string | null
          city?: string | null
          address?: string | null
          description?: string | null
          contact_name?: string
          contact_phone?: string | null
          contact_email?: string
          website?: string | null
          verified?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          id: string
          company_id: string | null
          title: string
          description: string | null
          requirements: string | null
          location_state: string
          location_city: string | null
          modality: string
          salary_range: string | null
          contact_email: string
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          company_id?: string | null
          title: string
          description?: string | null
          requirements?: string | null
          location_state: string
          location_city?: string | null
          modality: string
          salary_range?: string | null
          contact_email: string
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string | null
          title?: string
          description?: string | null
          requirements?: string | null
          location_state?: string
          location_city?: string | null
          modality?: string
          salary_range?: string | null
          contact_email?: string
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      supplies: {
        Row: {
          id: string
          user_id: string | null
          type: string
          category: string
          title: string
          description: string | null
          quantity: number | null
          condition: string | null
          state: string
          municipality: string | null
          city: string | null
          address: string | null
          contact_name: string
          contact_phone: string | null
          needs_transport: boolean | null
          photos: string[] | null
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          type: string
          category: string
          title: string
          description?: string | null
          quantity?: number | null
          condition?: string | null
          state: string
          municipality?: string | null
          city?: string | null
          address?: string | null
          contact_name: string
          contact_phone?: string | null
          needs_transport?: boolean | null
          photos?: string[] | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          type?: string
          category?: string
          title?: string
          description?: string | null
          quantity?: number | null
          condition?: string | null
          state?: string
          municipality?: string | null
          city?: string | null
          address?: string | null
          contact_name?: string
          contact_phone?: string | null
          needs_transport?: boolean | null
          photos?: string[] | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      graphics: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string
          file: string
          thumbnail: string | null
          tags: string | null
          downloads: number | null
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: string
          file: string
          thumbnail?: string | null
          tags?: string | null
          downloads?: number | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string
          file?: string
          thumbnail?: string | null
          tags?: string | null
          downloads?: number | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      city_coords: {
        Row: {
          id: string
          city: string
          state: string
          lat: number
          lng: number
        }
        Insert: {
          id?: string
          city: string
          state: string
          lat: number
          lng: number
        }
        Update: {
          id?: string
          city?: string
          state?: string
          lat?: number
          lng?: number
        }
        Relationships: []
      }
      route_segments: {
        Row: {
          id: string
          match_id: string | null
          transportista_id: string | null
          travel_request_id: string | null
          origin_city: string
          origin_state: string
          origin_lat: number | null
          origin_lng: number | null
          destination_city: string
          destination_state: string
          destination_lat: number | null
          destination_lng: number | null
          distance_km: number | null
          order: number
          is_full_route: boolean | null
          status: string | null
          created_at: string | null
          route_geometry: Json | null
          scheduled_date: string | null
          estimated_hours: number | null
        }
        Insert: {
          id?: string
          match_id?: string | null
          transportista_id?: string | null
          travel_request_id?: string | null
          origin_city: string
          origin_state: string
          origin_lat?: number | null
          origin_lng?: number | null
          destination_city: string
          destination_state: string
          destination_lat?: number | null
          destination_lng?: number | null
          distance_km?: number | null
          order?: number
          is_full_route?: boolean | null
          status?: string | null
          created_at?: string | null
          route_geometry?: Json | null
          scheduled_date?: string | null
          estimated_hours?: number | null
        }
        Update: {
          id?: string
          match_id?: string | null
          transportista_id?: string | null
          travel_request_id?: string | null
          origin_city?: string
          origin_state?: string
          origin_lat?: number | null
          origin_lng?: number | null
          destination_city?: string
          destination_state?: string
          destination_lat?: number | null
          destination_lng?: number | null
          distance_km?: number | null
          order?: number
          is_full_route?: boolean | null
          status?: string | null
          created_at?: string | null
          route_geometry?: Json | null
          scheduled_date?: string | null
          estimated_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "route_segments_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_segments_transportista_id_fkey"
            columns: ["transportista_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_segments_travel_request_id_fkey"
            columns: ["travel_request_id"]
            isOneToOne: false
            referencedRelation: "travel_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          id: string
          name: string
          description: string | null
          contact_email: string | null
          contact_phone: string | null
          logo_url: string | null
          admin_id: string
          status: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          logo_url?: string | null
          admin_id: string
          status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          logo_url?: string | null
          admin_id?: string
          status?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          member_id: string
          role: string | null
          status: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          member_id: string
          role?: string | null
          status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          member_id?: string
          role?: string | null
          status?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          id: string
          match_id: string | null
          sender_id: string | null
          content: string
          created_at: string | null
        }
        Insert: {
          id?: string
          match_id?: string | null
          sender_id?: string | null
          content: string
          created_at?: string | null
        }
        Update: {
          id?: string
          match_id?: string | null
          sender_id?: string | null
          content?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transportista_territories: {
        Row: {
          id: string
          user_id: string
          center_lat: number
          center_lng: number
          radius_km: number
          label: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          center_lat: number
          center_lng: number
          radius_km: number
          label?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          center_lat?: number
          center_lng?: number
          radius_km?: number
          label?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transportista_territories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_providers: {
        Row: {
          id: string
          name: string
          description: string | null
          website: string | null
          donation_link: string | null
          contact_email: string | null
          contact_phone: string | null
          services: string[] | null
          logo_url: string | null
          status: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          website?: string | null
          donation_link?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          services?: string[] | null
          logo_url?: string | null
          status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          website?: string | null
          donation_link?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          services?: string[] | null
          logo_url?: string | null
          status?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      family_aid_requests: {
        Row: {
          id: string
          user_id: string | null
          title: string
          description: string | null
          story: string | null
          amount_needed: number | null
          help_type: string
          location_state: string | null
          location_city: string | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          description?: string | null
          story?: string | null
          amount_needed?: number | null
          help_type: string
          location_state?: string | null
          location_city?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          description?: string | null
          story?: string | null
          amount_needed?: number | null
          help_type?: string
          location_state?: string | null
          location_city?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_aid_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

type PublicSchema = Database["public"]

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"]

// Convenience aliases for the most commonly referenced row shapes.
export type Profile = Tables<"profiles">
export type Estado = Tables<"estados">
export type CityCoord = Tables<"city_coords">
export type TravelRequest = Tables<"travel_requests">
export type TransportOffer = Tables<"transport_offers">
export type HousingOffer = Tables<"housing_offers">
export type Donation = Tables<"donations">
export type Match = Tables<"matches">
export type Review = Tables<"reviews">
export type Company = Tables<"companies">
export type Job = Tables<"jobs">
export type Supply = Tables<"supplies">
export type Graphic = Tables<"graphics">
export type RouteSegment = Tables<"route_segments">
export type Organization = Tables<"organizations">
export type OrganizationMember = Tables<"organization_members">
export type Message = Tables<"messages">
export type TransportistaTerritory = Tables<"transportista_territories">
export type ServiceProvider = Tables<"service_providers">
export type FamilyAidRequest = Tables<"family_aid_requests">
export type DonationSetting = Tables<"donation_settings">

export type Role =
  | "damnificado"
  | "transportista"
  | "anfitrion"
  | "donante"
  | "voluntario"
  | "organizacion"
  | "admin"
