export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      _tts_debug_log: {
        Row: {
          created_at: string
          detail: string | null
          id: number
          stage: string | null
          status: number | null
        }
        Insert: {
          created_at?: string
          detail?: string | null
          id?: never
          stage?: string | null
          status?: number | null
        }
        Update: {
          created_at?: string
          detail?: string | null
          id?: never
          stage?: string | null
          status?: number | null
        }
        Relationships: []
      }
      achievement_cards: {
        Row: {
          activity_category: string | null
          age_category: string | null
          athlete_stats: Json | null
          bio_line: string | null
          card_number: string | null
          card_type: string
          category_label: string | null
          completion_count: number | null
          created_at: string | null
          distance_type: string | null
          earned_at: string | null
          exercise_name: string | null
          global_rank_pct: number | null
          id: string
          image_url: string | null
          is_auto: boolean
          media_type: string | null
          metadata: Json | null
          overall_rating: number | null
          pb_rank: number | null
          pb_unit: string | null
          pb_value: number | null
          programme_name: string | null
          programme_type: string | null
          purchased: boolean | null
          rarity: string
          record_unit: string | null
          record_value: number | null
          source_run_id: string | null
          source_session_id: string | null
          subtitle: string | null
          title: string
          updated_at: string | null
          user_id: string
          video_url: string | null
        }
        Insert: {
          activity_category?: string | null
          age_category?: string | null
          athlete_stats?: Json | null
          bio_line?: string | null
          card_number?: string | null
          card_type: string
          category_label?: string | null
          completion_count?: number | null
          created_at?: string | null
          distance_type?: string | null
          earned_at?: string | null
          exercise_name?: string | null
          global_rank_pct?: number | null
          id?: string
          image_url?: string | null
          is_auto?: boolean
          media_type?: string | null
          metadata?: Json | null
          overall_rating?: number | null
          pb_rank?: number | null
          pb_unit?: string | null
          pb_value?: number | null
          programme_name?: string | null
          programme_type?: string | null
          purchased?: boolean | null
          rarity: string
          record_unit?: string | null
          record_value?: number | null
          source_run_id?: string | null
          source_session_id?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          video_url?: string | null
        }
        Update: {
          activity_category?: string | null
          age_category?: string | null
          athlete_stats?: Json | null
          bio_line?: string | null
          card_number?: string | null
          card_type?: string
          category_label?: string | null
          completion_count?: number | null
          created_at?: string | null
          distance_type?: string | null
          earned_at?: string | null
          exercise_name?: string | null
          global_rank_pct?: number | null
          id?: string
          image_url?: string | null
          is_auto?: boolean
          media_type?: string | null
          metadata?: Json | null
          overall_rating?: number | null
          pb_rank?: number | null
          pb_unit?: string | null
          pb_value?: number | null
          programme_name?: string | null
          programme_type?: string | null
          purchased?: boolean | null
          rarity?: string
          record_unit?: string | null
          record_value?: number | null
          source_run_id?: string | null
          source_session_id?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      admin_activity_logs: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      ai_tiers: {
        Row: {
          created_at: string | null
          display_name: string
          features: Json | null
          id: string
          is_active: boolean | null
          monthly_tokens: number
          name: string
          price_pence: number
          sort_order: number | null
          stripe_price_id: string | null
          stripe_product_id: string | null
        }
        Insert: {
          created_at?: string | null
          display_name: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          monthly_tokens: number
          name: string
          price_pence?: number
          sort_order?: number | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          monthly_tokens?: number
          name?: string
          price_pence?: number
          sort_order?: number | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
        }
        Relationships: []
      }
      alleyway_scores: {
        Row: {
          created_at: string
          id: string
          score: number
          theme_shifts: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          score?: number
          theme_shifts?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          score?: number
          theme_shifts?: number
          user_id?: string
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      cardio_programs: {
        Row: {
          auto_track_enabled: boolean
          created_at: string
          current_day: number | null
          current_week: number | null
          id: string
          is_active: boolean
          name: string
          overview: string | null
          program_data: Json
          started_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_track_enabled?: boolean
          created_at?: string
          current_day?: number | null
          current_week?: number | null
          id?: string
          is_active?: boolean
          name: string
          overview?: string | null
          program_data: Json
          started_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_track_enabled?: boolean
          created_at?: string
          current_day?: number | null
          current_week?: number | null
          id?: string
          is_active?: boolean
          name?: string
          overview?: string | null
          program_data?: Json
          started_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cardio_session_planners: {
        Row: {
          actual_distance_km: number | null
          actual_duration_minutes: number | null
          cooldown: string | null
          created_at: string
          day_number: number
          distance_km: number | null
          duration_minutes: number | null
          id: string
          is_auto_tracked: boolean
          notes: string | null
          planned_session: Json
          program_id: string | null
          scheduled_date: string | null
          session_type: string
          status: string | null
          updated_at: string
          user_id: string
          warmup: string | null
          week_number: number
        }
        Insert: {
          actual_distance_km?: number | null
          actual_duration_minutes?: number | null
          cooldown?: string | null
          created_at?: string
          day_number: number
          distance_km?: number | null
          duration_minutes?: number | null
          id?: string
          is_auto_tracked?: boolean
          notes?: string | null
          planned_session?: Json
          program_id?: string | null
          scheduled_date?: string | null
          session_type: string
          status?: string | null
          updated_at?: string
          user_id: string
          warmup?: string | null
          week_number: number
        }
        Update: {
          actual_distance_km?: number | null
          actual_duration_minutes?: number | null
          cooldown?: string | null
          created_at?: string
          day_number?: number
          distance_km?: number | null
          duration_minutes?: number | null
          id?: string
          is_auto_tracked?: boolean
          notes?: string | null
          planned_session?: Json
          program_id?: string | null
          scheduled_date?: string | null
          session_type?: string
          status?: string | null
          updated_at?: string
          user_id?: string
          warmup?: string | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "cardio_session_planners_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "cardio_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_availability_slots: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          session_length: string
          start_time: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          session_length?: string
          start_time: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          session_length?: string
          start_time?: string
          user_id?: string
        }
        Relationships: []
      }
      coach_blocked_dates: {
        Row: {
          blocked_date: string
          created_at: string
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          blocked_date: string
          created_at?: string
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          blocked_date?: string
          created_at?: string
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      coach_meta_credentials: {
        Row: {
          created_at: string
          facebook_page_id: string
          id: string
          instagram_account_id: string | null
          page_access_token: string
          page_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          facebook_page_id: string
          id?: string
          instagram_account_id?: string | null
          page_access_token: string
          page_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          facebook_page_id?: string
          id?: string
          instagram_account_id?: string | null
          page_access_token?: string
          page_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      coach_public_profiles: {
        Row: {
          accepting_clients: boolean | null
          availability_schedule: Json | null
          bio: string | null
          block_12_price: number | null
          block_4_price: number | null
          block_8_price: number | null
          block_session_length: string | null
          booking_notes: string | null
          certifications: string[] | null
          check_in_frequency: string | null
          coaching_style: string | null
          consultation_length: string | null
          created_at: string
          currency: string | null
          current_clients: number | null
          free_consultation: boolean | null
          headline: string | null
          id: string
          ideal_client: string | null
          in_person_location: string | null
          in_person_session_price_gbp: number | null
          instagram_handle: string | null
          intro_call_duration_mins: number | null
          intro_call_enabled: boolean | null
          is_published: boolean | null
          max_clients: number | null
          monthly_price_gbp: number | null
          offers_in_person: boolean | null
          offers_online: boolean | null
          online_monthly_rate: number | null
          online_session_price_gbp: number | null
          programme_blocks_enabled: boolean | null
          session_rate_30min: number | null
          session_rate_60min: number | null
          session_types: string[] | null
          specializations: string[] | null
          stripe_connect_id: string | null
          stripe_onboarded: boolean | null
          updated_at: string
          user_id: string
          video_assessment_enabled: boolean | null
          website_url: string | null
          years_experience: number | null
        }
        Insert: {
          accepting_clients?: boolean | null
          availability_schedule?: Json | null
          bio?: string | null
          block_12_price?: number | null
          block_4_price?: number | null
          block_8_price?: number | null
          block_session_length?: string | null
          booking_notes?: string | null
          certifications?: string[] | null
          check_in_frequency?: string | null
          coaching_style?: string | null
          consultation_length?: string | null
          created_at?: string
          currency?: string | null
          current_clients?: number | null
          free_consultation?: boolean | null
          headline?: string | null
          id?: string
          ideal_client?: string | null
          in_person_location?: string | null
          in_person_session_price_gbp?: number | null
          instagram_handle?: string | null
          intro_call_duration_mins?: number | null
          intro_call_enabled?: boolean | null
          is_published?: boolean | null
          max_clients?: number | null
          monthly_price_gbp?: number | null
          offers_in_person?: boolean | null
          offers_online?: boolean | null
          online_monthly_rate?: number | null
          online_session_price_gbp?: number | null
          programme_blocks_enabled?: boolean | null
          session_rate_30min?: number | null
          session_rate_60min?: number | null
          session_types?: string[] | null
          specializations?: string[] | null
          stripe_connect_id?: string | null
          stripe_onboarded?: boolean | null
          updated_at?: string
          user_id: string
          video_assessment_enabled?: boolean | null
          website_url?: string | null
          years_experience?: number | null
        }
        Update: {
          accepting_clients?: boolean | null
          availability_schedule?: Json | null
          bio?: string | null
          block_12_price?: number | null
          block_4_price?: number | null
          block_8_price?: number | null
          block_session_length?: string | null
          booking_notes?: string | null
          certifications?: string[] | null
          check_in_frequency?: string | null
          coaching_style?: string | null
          consultation_length?: string | null
          created_at?: string
          currency?: string | null
          current_clients?: number | null
          free_consultation?: boolean | null
          headline?: string | null
          id?: string
          ideal_client?: string | null
          in_person_location?: string | null
          in_person_session_price_gbp?: number | null
          instagram_handle?: string | null
          intro_call_duration_mins?: number | null
          intro_call_enabled?: boolean | null
          is_published?: boolean | null
          max_clients?: number | null
          monthly_price_gbp?: number | null
          offers_in_person?: boolean | null
          offers_online?: boolean | null
          online_monthly_rate?: number | null
          online_session_price_gbp?: number | null
          programme_blocks_enabled?: boolean | null
          session_rate_30min?: number | null
          session_rate_60min?: number | null
          session_types?: string[] | null
          specializations?: string[] | null
          stripe_connect_id?: string | null
          stripe_onboarded?: boolean | null
          updated_at?: string
          user_id?: string
          video_assessment_enabled?: boolean | null
          website_url?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      coach_unlocks: {
        Row: {
          coach_id: string
          created_at: string
          id: string
          tokens_spent: number
          user_id: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          id?: string
          tokens_spent?: number
          user_id: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          id?: string
          tokens_spent?: number
          user_id?: string
        }
        Relationships: []
      }
      coaching_assignments: {
        Row: {
          assigned_by: string | null
          athlete_id: string
          coach_id: string
          created_at: string
          id: string
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_by?: string | null
          athlete_id: string
          coach_id: string
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_by?: string | null
          athlete_id?: string
          coach_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      coaching_bookings: {
        Row: {
          block_type: string
          cancellation_reason: string | null
          coach_id: string
          created_at: string
          id: string
          notes: string | null
          payment_status: string
          price_gbp: number
          service_type: string
          session_date: string
          session_time: string
          sessions_remaining: number | null
          status: string
          stripe_payment_intent: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          block_type?: string
          cancellation_reason?: string | null
          coach_id: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_status?: string
          price_gbp?: number
          service_type: string
          session_date: string
          session_time: string
          sessions_remaining?: number | null
          status?: string
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          block_type?: string
          cancellation_reason?: string | null
          coach_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_status?: string
          price_gbp?: number
          service_type?: string
          session_date?: string
          session_time?: string
          sessions_remaining?: number | null
          status?: string
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      coaching_check_ins: {
        Row: {
          arm_cm: number | null
          assignment_id: string
          athlete_id: string
          athlete_notes: string | null
          body_fat_pct: number | null
          challenges: string | null
          check_in_number: number | null
          chest_cm: number | null
          coach_id: string
          coach_response: string | null
          created_at: string
          due_date: string | null
          energy_level: number | null
          hips_cm: number | null
          id: string
          mood: number | null
          nutrition_compliance: number | null
          photo_back: string | null
          photo_front: string | null
          photo_side: string | null
          reviewed_at: string | null
          sleep_quality: number | null
          soreness: number | null
          status: string
          steps_avg: number | null
          stress_level: number | null
          submitted_at: string | null
          thigh_cm: number | null
          training_compliance: number | null
          updated_at: string
          waist_cm: number | null
          water_litres: number | null
          weight_kg: number | null
          wins: string | null
        }
        Insert: {
          arm_cm?: number | null
          assignment_id: string
          athlete_id: string
          athlete_notes?: string | null
          body_fat_pct?: number | null
          challenges?: string | null
          check_in_number?: number | null
          chest_cm?: number | null
          coach_id: string
          coach_response?: string | null
          created_at?: string
          due_date?: string | null
          energy_level?: number | null
          hips_cm?: number | null
          id?: string
          mood?: number | null
          nutrition_compliance?: number | null
          photo_back?: string | null
          photo_front?: string | null
          photo_side?: string | null
          reviewed_at?: string | null
          sleep_quality?: number | null
          soreness?: number | null
          status?: string
          steps_avg?: number | null
          stress_level?: number | null
          submitted_at?: string | null
          thigh_cm?: number | null
          training_compliance?: number | null
          updated_at?: string
          waist_cm?: number | null
          water_litres?: number | null
          weight_kg?: number | null
          wins?: string | null
        }
        Update: {
          arm_cm?: number | null
          assignment_id?: string
          athlete_id?: string
          athlete_notes?: string | null
          body_fat_pct?: number | null
          challenges?: string | null
          check_in_number?: number | null
          chest_cm?: number | null
          coach_id?: string
          coach_response?: string | null
          created_at?: string
          due_date?: string | null
          energy_level?: number | null
          hips_cm?: number | null
          id?: string
          mood?: number | null
          nutrition_compliance?: number | null
          photo_back?: string | null
          photo_front?: string | null
          photo_side?: string | null
          reviewed_at?: string | null
          sleep_quality?: number | null
          soreness?: number | null
          status?: string
          steps_avg?: number | null
          stress_level?: number | null
          submitted_at?: string | null
          thigh_cm?: number | null
          training_compliance?: number | null
          updated_at?: string
          waist_cm?: number | null
          water_litres?: number | null
          weight_kg?: number | null
          wins?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coaching_check_ins_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "coaching_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_feedback: {
        Row: {
          athlete_id: string
          coach_id: string
          created_at: string
          data: Json | null
          feedback_type: string
          general_comments: string | null
          id: string
          next_session_goals: string | null
          performance_rating: number | null
          related_program_id: string | null
          related_session_id: string | null
          technique_notes: string | null
          title: string
          updated_at: string
        }
        Insert: {
          athlete_id: string
          coach_id: string
          created_at?: string
          data?: Json | null
          feedback_type?: string
          general_comments?: string | null
          id?: string
          next_session_goals?: string | null
          performance_rating?: number | null
          related_program_id?: string | null
          related_session_id?: string | null
          technique_notes?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          athlete_id?: string
          coach_id?: string
          created_at?: string
          data?: Json | null
          feedback_type?: string
          general_comments?: string | null
          id?: string
          next_session_goals?: string | null
          performance_rating?: number | null
          related_program_id?: string | null
          related_session_id?: string | null
          technique_notes?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      coaching_profiles: {
        Row: {
          age_years: number | null
          allergies: string | null
          apollo_contact_id: string | null
          bench_max_kg: number | null
          biggest_challenge: string | null
          city: string | null
          created_at: string
          days_per_week: number | null
          deadlift_max_kg: number | null
          dietary_preferences: string | null
          experience_level: string | null
          fitness_level: string | null
          gender: string | null
          height_cm: number | null
          id: string
          injuries: string | null
          meals_per_day: number | null
          mental_health: string | null
          notification_preferences: Json | null
          nutrition_goal: string | null
          onboarding_completed: boolean
          onboarding_completed_at: string | null
          preferred_cardio: string | null
          preferred_height_unit: string
          preferred_weight_unit: string
          primary_motivation: string | null
          race_goals: string | null
          session_length_minutes: number | null
          signup_source: string | null
          sleep_hours: number | null
          sleep_quality: string | null
          sport_preference: string | null
          squat_max_kg: number | null
          stress_level: string | null
          stripe_connect_id: string | null
          stripe_onboarded: boolean | null
          training_goal: string | null
          updated_at: string
          user_id: string
          weekly_cardio_frequency: number | null
          weight_kg: number | null
        }
        Insert: {
          age_years?: number | null
          allergies?: string | null
          apollo_contact_id?: string | null
          bench_max_kg?: number | null
          biggest_challenge?: string | null
          city?: string | null
          created_at?: string
          days_per_week?: number | null
          deadlift_max_kg?: number | null
          dietary_preferences?: string | null
          experience_level?: string | null
          fitness_level?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          injuries?: string | null
          meals_per_day?: number | null
          mental_health?: string | null
          notification_preferences?: Json | null
          nutrition_goal?: string | null
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          preferred_cardio?: string | null
          preferred_height_unit?: string
          preferred_weight_unit?: string
          primary_motivation?: string | null
          race_goals?: string | null
          session_length_minutes?: number | null
          signup_source?: string | null
          sleep_hours?: number | null
          sleep_quality?: string | null
          sport_preference?: string | null
          squat_max_kg?: number | null
          stress_level?: string | null
          stripe_connect_id?: string | null
          stripe_onboarded?: boolean | null
          training_goal?: string | null
          updated_at?: string
          user_id: string
          weekly_cardio_frequency?: number | null
          weight_kg?: number | null
        }
        Update: {
          age_years?: number | null
          allergies?: string | null
          apollo_contact_id?: string | null
          bench_max_kg?: number | null
          biggest_challenge?: string | null
          city?: string | null
          created_at?: string
          days_per_week?: number | null
          deadlift_max_kg?: number | null
          dietary_preferences?: string | null
          experience_level?: string | null
          fitness_level?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          injuries?: string | null
          meals_per_day?: number | null
          mental_health?: string | null
          notification_preferences?: Json | null
          nutrition_goal?: string | null
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          preferred_cardio?: string | null
          preferred_height_unit?: string
          preferred_weight_unit?: string
          primary_motivation?: string | null
          race_goals?: string | null
          session_length_minutes?: number | null
          signup_source?: string | null
          sleep_hours?: number | null
          sleep_quality?: string | null
          sport_preference?: string | null
          squat_max_kg?: number | null
          stress_level?: string | null
          stripe_connect_id?: string | null
          stripe_onboarded?: boolean | null
          training_goal?: string | null
          updated_at?: string
          user_id?: string
          weekly_cardio_frequency?: number | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      coaching_session_bookings: {
        Row: {
          athlete_id: string
          coach_id: string
          coach_notes: string | null
          created_at: string | null
          end_time: string
          id: string
          location: string | null
          notes: string | null
          price_gbp: number | null
          session_date: string
          session_type: string
          start_time: string
          status: string
          updated_at: string | null
        }
        Insert: {
          athlete_id: string
          coach_id: string
          coach_notes?: string | null
          created_at?: string | null
          end_time: string
          id?: string
          location?: string | null
          notes?: string | null
          price_gbp?: number | null
          session_date: string
          session_type?: string
          start_time: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          athlete_id?: string
          coach_id?: string
          coach_notes?: string | null
          created_at?: string | null
          end_time?: string
          id?: string
          location?: string | null
          notes?: string | null
          price_gbp?: number | null
          session_date?: string
          session_type?: string
          start_time?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          run_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          run_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          run_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          is_deleted: boolean
          joined_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          is_deleted?: boolean
          joined_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          is_deleted?: boolean
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      course_purchases: {
        Row: {
          coins_spent: number | null
          course_key: string
          id: string
          payment_method: string
          purchased_at: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          coins_spent?: number | null
          course_key: string
          id?: string
          payment_method?: string
          purchased_at?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          coins_spent?: number | null
          course_key?: string
          id?: string
          payment_method?: string
          purchased_at?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      customer_success_ai_audit_log: {
        Row: {
          created_at: string
          data_sources_accessed: Json | null
          error_message: string | null
          escalation_flag: boolean
          escalation_reason: string | null
          human_feedback: Json | null
          id: string
          member_user_id: string | null
          model: string | null
          question: string
          question_category: string | null
          requested_by: string
          response_status: string
          response_text: string | null
        }
        Insert: {
          created_at?: string
          data_sources_accessed?: Json | null
          error_message?: string | null
          escalation_flag?: boolean
          escalation_reason?: string | null
          human_feedback?: Json | null
          id?: string
          member_user_id?: string | null
          model?: string | null
          question: string
          question_category?: string | null
          requested_by: string
          response_status: string
          response_text?: string | null
        }
        Update: {
          created_at?: string
          data_sources_accessed?: Json | null
          error_message?: string | null
          escalation_flag?: boolean
          escalation_reason?: string | null
          human_feedback?: Json | null
          id?: string
          member_user_id?: string | null
          model?: string | null
          question?: string
          question_category?: string | null
          requested_by?: string
          response_status?: string
          response_text?: string | null
        }
        Relationships: []
      }
      daily_habits: {
        Row: {
          breathwork_done: boolean | null
          cold_shower: boolean | null
          created_at: string
          do_the_hard_thing: boolean
          habit_date: string
          hit_your_numbers: boolean
          id: string
          journal: string
          learn_daily: boolean
          sauna: boolean | null
          train: boolean
          updated_at: string
          user_id: string
          water: boolean
          water_glasses: number | null
        }
        Insert: {
          breathwork_done?: boolean | null
          cold_shower?: boolean | null
          created_at?: string
          do_the_hard_thing?: boolean
          habit_date?: string
          hit_your_numbers?: boolean
          id?: string
          journal?: string
          learn_daily?: boolean
          sauna?: boolean | null
          train?: boolean
          updated_at?: string
          user_id: string
          water?: boolean
          water_glasses?: number | null
        }
        Update: {
          breathwork_done?: boolean | null
          cold_shower?: boolean | null
          created_at?: string
          do_the_hard_thing?: boolean
          habit_date?: string
          hit_your_numbers?: boolean
          id?: string
          journal?: string
          learn_daily?: boolean
          sauna?: boolean | null
          train?: boolean
          updated_at?: string
          user_id?: string
          water?: boolean
          water_glasses?: number | null
        }
        Relationships: []
      }
      email_drip: {
        Row: {
          created_at: string | null
          day_number: number
          email: string
          error_message: string | null
          id: string
          scheduled_for: string
          sent_at: string | null
          sequence_name: string | null
          status: string
          subject: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          day_number: number
          email: string
          error_message?: string | null
          id?: string
          scheduled_for: string
          sent_at?: string | null
          sequence_name?: string | null
          status?: string
          subject?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          day_number?: number
          email?: string
          error_message?: string | null
          id?: string
          scheduled_for?: string
          sent_at?: string | null
          sequence_name?: string | null
          status?: string
          subject?: string | null
          user_id?: string
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          created_at: string
          id: string
          message: string
          source: string | null
          stack: string | null
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          source?: string | null
          stack?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          source?: string | null
          stack?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      exercise_artwork_cache: {
        Row: {
          created_at: string | null
          exercise_name: string
          id: string
          image_url: string
          prompt_used: string | null
          sex: string
        }
        Insert: {
          created_at?: string | null
          exercise_name: string
          id?: string
          image_url: string
          prompt_used?: string | null
          sex?: string
        }
        Update: {
          created_at?: string | null
          exercise_name?: string
          id?: string
          image_url?: string
          prompt_used?: string | null
          sex?: string
        }
        Relationships: []
      }
      exercise_logs: {
        Row: {
          actual_reps: number | null
          completed: boolean
          confidence_rating: number | null
          created_at: string
          equipment: string
          exercise_name: string
          id: string
          is_auto_tracked: boolean
          notes: string | null
          pain_flag: boolean | null
          rpe: number | null
          session_id: string
          set_number: number
          target_reps: string | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          actual_reps?: number | null
          completed?: boolean
          confidence_rating?: number | null
          created_at?: string
          equipment: string
          exercise_name: string
          id?: string
          is_auto_tracked?: boolean
          notes?: string | null
          pain_flag?: boolean | null
          rpe?: number | null
          session_id: string
          set_number: number
          target_reps?: string | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          actual_reps?: number | null
          completed?: boolean
          confidence_rating?: number | null
          created_at?: string
          equipment?: string
          exercise_name?: string
          id?: string
          is_auto_tracked?: boolean
          notes?: string | null
          pain_flag?: boolean | null
          rpe?: number | null
          session_id?: string
          set_number?: number
          target_reps?: string | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_videos: {
        Row: {
          analysis_result: Json | null
          analysis_status: string | null
          created_at: string
          duration_seconds: number | null
          exercise_log_id: string | null
          exercise_name: string
          id: string
          session_id: string | null
          thumbnail_url: string | null
          user_id: string
          video_url: string
        }
        Insert: {
          analysis_result?: Json | null
          analysis_status?: string | null
          created_at?: string
          duration_seconds?: number | null
          exercise_log_id?: string | null
          exercise_name: string
          id?: string
          session_id?: string | null
          thumbnail_url?: string | null
          user_id: string
          video_url: string
        }
        Update: {
          analysis_result?: Json | null
          analysis_status?: string | null
          created_at?: string
          duration_seconds?: number | null
          exercise_log_id?: string | null
          exercise_name?: string
          id?: string
          session_id?: string | null
          thumbnail_url?: string | null
          user_id?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_videos_exercise_log_id_fkey"
            columns: ["exercise_log_id"]
            isOneToOne: false
            referencedRelation: "exercise_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_videos_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_responses: {
        Row: {
          content: string | null
          created_at: string
          feedback_id: string
          id: string
          response_type: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          feedback_id: string
          id?: string
          response_type?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          feedback_id?: string
          id?: string
          response_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_responses_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "coaching_feedback"
            referencedColumns: ["id"]
          },
        ]
      }
      flappy_scores: {
        Row: {
          created_at: string
          id: string
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          score?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      flow_scores: {
        Row: {
          created_at: string
          id: string
          max_speed: number | null
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_speed?: number | null
          score?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          max_speed?: number | null
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      focus_sessions: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          duration_minutes: number | null
          focus_type: string | null
          id: string
          score: number
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          duration_minutes?: number | null
          focus_type?: string | null
          id?: string
          score?: number
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          duration_minutes?: number | null
          focus_type?: string | null
          id?: string
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      focus_timer_scores: {
        Row: {
          created_at: string
          id: string
          score: number
          sessions_completed: number | null
          total_minutes: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          score?: number
          sessions_completed?: number | null
          total_minutes?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          score?: number
          sessions_completed?: number | null
          total_minutes?: number | null
          user_id?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      food_logs: {
        Row: {
          barcode: string | null
          brand: string | null
          calories: number
          carbs_g: number | null
          created_at: string
          fat_g: number | null
          fiber_g: number | null
          food_name: string
          id: string
          logged_at: string
          meal_type: string
          notes: string | null
          protein_g: number | null
          recipe_id: string | null
          serving_size: string | null
          servings: number | null
          sodium_mg: number | null
          sugar_g: number | null
          user_id: string
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          calories: number
          carbs_g?: number | null
          created_at?: string
          fat_g?: number | null
          fiber_g?: number | null
          food_name: string
          id?: string
          logged_at?: string
          meal_type: string
          notes?: string | null
          protein_g?: number | null
          recipe_id?: string | null
          serving_size?: string | null
          servings?: number | null
          sodium_mg?: number | null
          sugar_g?: number | null
          user_id: string
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          calories?: number
          carbs_g?: number | null
          created_at?: string
          fat_g?: number | null
          fiber_g?: number | null
          food_name?: string
          id?: string
          logged_at?: string
          meal_type?: string
          notes?: string | null
          protein_g?: number | null
          recipe_id?: string | null
          serving_size?: string | null
          servings?: number | null
          sodium_mg?: number | null
          sugar_g?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_logs_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      help_conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      help_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "help_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "help_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      kudos: {
        Row: {
          created_at: string
          id: string
          run_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          run_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          run_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kudos_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
        ]
      }
      live_streams: {
        Row: {
          allow_comments: boolean | null
          created_at: string
          description: string | null
          ended_at: string | null
          id: string
          started_at: string | null
          status: string
          stream_key: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
          viewer_count: number | null
          visibility: string
        }
        Insert: {
          allow_comments?: boolean | null
          created_at?: string
          description?: string | null
          ended_at?: string | null
          id?: string
          started_at?: string | null
          status?: string
          stream_key?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id: string
          viewer_count?: number | null
          visibility?: string
        }
        Update: {
          allow_comments?: boolean | null
          created_at?: string
          description?: string | null
          ended_at?: string | null
          id?: string
          started_at?: string | null
          status?: string
          stream_key?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          viewer_count?: number | null
          visibility?: string
        }
        Relationships: []
      }
      local_legend_stats: {
        Row: {
          effort_count: number | null
          id: string
          is_local_legend: boolean | null
          last_effort_at: string | null
          segment_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          effort_count?: number | null
          id?: string
          is_local_legend?: boolean | null
          last_effort_at?: string | null
          segment_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          effort_count?: number | null
          id?: string
          is_local_legend?: boolean | null
          last_effort_at?: string | null
          segment_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "local_legend_stats_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "segments"
            referencedColumns: ["id"]
          },
        ]
      }
      login_streaks: {
        Row: {
          best_streak: number
          current_streak: number
          last_login_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          best_streak?: number
          current_streak?: number
          last_login_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          best_streak?: number
          current_streak?: number
          last_login_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      math_scores: {
        Row: {
          avatar_url: string | null
          correct_answers: number | null
          created_at: string | null
          display_name: string | null
          id: string
          max_difficulty: number | null
          score: number
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          correct_answers?: number | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          max_difficulty?: number | null
          score?: number
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          correct_answers?: number | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          max_difficulty?: number | null
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      meal_plan_items: {
        Row: {
          calories: number | null
          carbs_g: number | null
          created_at: string
          day_of_week: number
          fat_g: number | null
          food_name: string | null
          id: string
          meal_plan_id: string
          meal_type: string
          notes: string | null
          protein_g: number | null
          recipe_id: string | null
          servings: number | null
          sort_order: number | null
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs_g?: number | null
          created_at?: string
          day_of_week: number
          fat_g?: number | null
          food_name?: string | null
          id?: string
          meal_plan_id: string
          meal_type: string
          notes?: string | null
          protein_g?: number | null
          recipe_id?: string | null
          servings?: number | null
          sort_order?: number | null
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs_g?: number | null
          created_at?: string
          day_of_week?: number
          fat_g?: number | null
          food_name?: string | null
          id?: string
          meal_plan_id?: string
          meal_type?: string
          notes?: string | null
          protein_g?: number | null
          recipe_id?: string | null
          servings?: number | null
          sort_order?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_items_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      medals: {
        Row: {
          code: string
          created_at: string
          description: string | null
          earned_at: string
          icon: string | null
          id: string
          name: string
          run_id: string | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          earned_at?: string
          icon?: string | null
          id?: string
          name: string
          run_id?: string | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          earned_at?: string
          icon?: string | null
          id?: string
          name?: string
          run_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medals_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_matrix_scores: {
        Row: {
          created_at: string
          id: string
          max_level: number
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_level?: number
          score?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          max_level?: number
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      memory_scores: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          max_grid: number | null
          max_level: number | null
          score: number
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          max_grid?: number | null
          max_level?: number | null
          score?: number
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          max_grid?: number | null
          max_level?: number | null
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      mental_maths_scores: {
        Row: {
          accuracy: number | null
          created_at: string
          id: string
          score: number
          solved: number | null
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          created_at?: string
          id?: string
          score?: number
          solved?: number | null
          user_id: string
        }
        Update: {
          accuracy?: number | null
          created_at?: string
          id?: string
          score?: number
          solved?: number | null
          user_id?: string
        }
        Relationships: []
      }
      message_drip: {
        Row: {
          created_at: string
          day_number: number
          error_message: string | null
          id: string
          scheduled_for: string
          sent_at: string | null
          sequence_name: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_number: number
          error_message?: string | null
          id?: string
          scheduled_for: string
          sent_at?: string | null
          sequence_name?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_number?: number
          error_message?: string | null
          id?: string
          scheduled_for?: string
          sent_at?: string | null
          sequence_name?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          delivered_at: string | null
          id: string
          image_url: string | null
          is_deleted: boolean
          read_at: string | null
          sender_id: string
          status: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          delivered_at?: string | null
          id?: string
          image_url?: string | null
          is_deleted?: boolean
          read_at?: string | null
          sender_id: string
          status?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          delivered_at?: string | null
          id?: string
          image_url?: string | null
          is_deleted?: boolean
          read_at?: string | null
          sender_id?: string
          status?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          achieved_at: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_shared: boolean | null
          milestone_type: string
          title: string
          user_id: string
          value: number | null
          visibility: string | null
        }
        Insert: {
          achieved_at?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_shared?: boolean | null
          milestone_type: string
          title: string
          user_id: string
          value?: number | null
          visibility?: string | null
        }
        Update: {
          achieved_at?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_shared?: boolean | null
          milestone_type?: string
          title?: string
          user_id?: string
          value?: number | null
          visibility?: string | null
        }
        Relationships: []
      }
      mindset_activity_completions: {
        Row: {
          activity_key: string
          activity_name: string | null
          activity_type: string | null
          completed_at: string
          day_number: number | null
          duration_minutes: number | null
          entry_text: string | null
          id: string
          programme_id: string
          user_id: string
          week_number: number | null
        }
        Insert: {
          activity_key: string
          activity_name?: string | null
          activity_type?: string | null
          completed_at?: string
          day_number?: number | null
          duration_minutes?: number | null
          entry_text?: string | null
          id?: string
          programme_id: string
          user_id: string
          week_number?: number | null
        }
        Update: {
          activity_key?: string
          activity_name?: string | null
          activity_type?: string | null
          completed_at?: string
          day_number?: number | null
          duration_minutes?: number | null
          entry_text?: string | null
          id?: string
          programme_id?: string
          user_id?: string
          week_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mindset_activity_completions_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "mindset_programmes"
            referencedColumns: ["id"]
          },
        ]
      }
      mindset_programmes: {
        Row: {
          completed_activities: Json
          created_at: string
          daily_minutes: number
          description: string | null
          duration_weeks: number
          focus_areas: string[] | null
          goal: string | null
          id: string
          is_active: boolean
          name: string
          programme_data: Json
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_activities?: Json
          created_at?: string
          daily_minutes?: number
          description?: string | null
          duration_weeks?: number
          focus_areas?: string[] | null
          goal?: string | null
          id?: string
          is_active?: boolean
          name: string
          programme_data?: Json
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_activities?: Json
          created_at?: string
          daily_minutes?: number
          description?: string | null
          duration_weeks?: number
          focus_areas?: string[] | null
          goal?: string | null
          id?: string
          is_active?: boolean
          name?: string
          programme_data?: Json
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json | null
          icon: string | null
          id: string
          read: boolean
          scheduled_for: string | null
          title: string
          type: string
          url: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json | null
          icon?: string | null
          id?: string
          read?: boolean
          scheduled_for?: string | null
          title: string
          type: string
          url?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json | null
          icon?: string | null
          id?: string
          read?: boolean
          scheduled_for?: string | null
          title?: string
          type?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nutrition_goals: {
        Row: {
          activity_level: string | null
          created_at: string
          daily_calories: number | null
          daily_carbs_g: number | null
          daily_fat_g: number | null
          daily_protein_g: number | null
          goals_mode: string
          id: string
          macro_split: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_level?: string | null
          created_at?: string
          daily_calories?: number | null
          daily_carbs_g?: number | null
          daily_fat_g?: number | null
          daily_protein_g?: number | null
          goals_mode?: string
          id?: string
          macro_split?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_level?: string | null
          created_at?: string
          daily_calories?: number | null
          daily_carbs_g?: number | null
          daily_fat_g?: number | null
          daily_protein_g?: number | null
          goals_mode?: string
          id?: string
          macro_split?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pattern_breaker_scores: {
        Row: {
          created_at: string
          id: string
          max_sequence: number
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_sequence?: number
          score?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          max_sequence?: number
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      pb_card_listings: {
        Row: {
          buy_now_price: number | null
          card_id: string
          created_at: string | null
          current_bid: number | null
          current_bidder_id: string | null
          ends_at: string
          id: string
          listing_type: string
          seller_id: string
          starting_price: number
          status: string
          updated_at: string | null
        }
        Insert: {
          buy_now_price?: number | null
          card_id: string
          created_at?: string | null
          current_bid?: number | null
          current_bidder_id?: string | null
          ends_at?: string
          id?: string
          listing_type?: string
          seller_id: string
          starting_price?: number
          status?: string
          updated_at?: string | null
        }
        Update: {
          buy_now_price?: number | null
          card_id?: string
          created_at?: string | null
          current_bid?: number | null
          current_bidder_id?: string | null
          ends_at?: string
          id?: string
          listing_type?: string
          seller_id?: string
          starting_price?: number
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pb_card_listings_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "achievement_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_session_checkins: {
        Row: {
          checkin_due_at: string
          completed_at: string
          created_at: string
          id: string
          sent: boolean
          session_id: string
          user_id: string
        }
        Insert: {
          checkin_due_at?: string
          completed_at?: string
          created_at?: string
          id?: string
          sent?: boolean
          session_id: string
          user_id: string
        }
        Update: {
          checkin_due_at?: string
          completed_at?: string
          created_at?: string
          id?: string
          sent?: boolean
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      personal_records: {
        Row: {
          achieved_at: string
          activity_type: string
          created_at: string
          distance_km: number | null
          distance_type: string
          id: string
          pace_per_km_seconds: number | null
          run_id: string | null
          time_seconds: number | null
          user_id: string
        }
        Insert: {
          achieved_at: string
          activity_type?: string
          created_at?: string
          distance_km?: number | null
          distance_type: string
          id?: string
          pace_per_km_seconds?: number | null
          run_id?: string | null
          time_seconds?: number | null
          user_id: string
        }
        Update: {
          achieved_at?: string
          activity_type?: string
          created_at?: string
          distance_km?: number | null
          distance_type?: string
          id?: string
          pace_per_km_seconds?: number | null
          run_id?: string | null
          time_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_records_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_kudos: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_kudos_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_media: {
        Row: {
          created_at: string
          duration_seconds: number | null
          file_size_bytes: number | null
          height: number | null
          id: string
          media_type: string
          media_url: string
          post_id: string
          sort_order: number
          thumbnail_url: string | null
          user_id: string
          width: number | null
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          file_size_bytes?: number | null
          height?: number | null
          id?: string
          media_type: string
          media_url: string
          post_id: string
          sort_order?: number
          thumbnail_url?: string | null
          user_id: string
          width?: number | null
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          file_size_bytes?: number | null
          height?: number | null
          id?: string
          media_type?: string
          media_url?: string
          post_id?: string
          sort_order?: number
          thumbnail_url?: string | null
          user_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "post_media_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments_enabled: boolean
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          meta_shared: boolean | null
          meta_shared_at: string | null
          updated_at: string
          user_id: string
          video_url: string | null
          visibility: string
        }
        Insert: {
          comments_enabled?: boolean
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          meta_shared?: boolean | null
          meta_shared_at?: string | null
          updated_at?: string
          user_id: string
          video_url?: string | null
          visibility?: string
        }
        Update: {
          comments_enabled?: boolean
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          meta_shared?: boolean | null
          meta_shared_at?: string | null
          updated_at?: string
          user_id?: string
          video_url?: string | null
          visibility?: string
        }
        Relationships: []
      }
      processed_stripe_events: {
        Row: {
          event_id: string
          event_type: string
          processed_at: string
        }
        Insert: {
          event_id: string
          event_type: string
          processed_at?: string
        }
        Update: {
          event_id?: string
          event_type?: string
          processed_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          bodyweight_kg: number | null
          created_at: string
          date_of_birth: string | null
          display_name: string | null
          id: string
          is_public: boolean
          location: string | null
          sex: string | null
          social_facebook: string | null
          social_instagram: string | null
          social_snapchat: string | null
          social_tiktok: string | null
          social_twitter: string | null
          social_youtube: string | null
          total_distance_km: number | null
          total_runs: number | null
          total_time_seconds: number | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          bodyweight_kg?: number | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          id?: string
          is_public?: boolean
          location?: string | null
          sex?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_snapchat?: string | null
          social_tiktok?: string | null
          social_twitter?: string | null
          social_youtube?: string | null
          total_distance_km?: number | null
          total_runs?: number | null
          total_time_seconds?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          bodyweight_kg?: number | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          id?: string
          is_public?: boolean
          location?: string | null
          sex?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_snapchat?: string | null
          social_tiktok?: string | null
          social_twitter?: string | null
          social_youtube?: string | null
          total_distance_km?: number | null
          total_runs?: number | null
          total_time_seconds?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      programme_calendar_syncs: {
        Row: {
          block_number: number
          id: string
          program_id: string
          program_type: string
          synced_at: string
          user_id: string
        }
        Insert: {
          block_number: number
          id?: string
          program_id: string
          program_type: string
          synced_at?: string
          user_id: string
        }
        Update: {
          block_number?: number
          id?: string
          program_id?: string
          program_type?: string
          synced_at?: string
          user_id?: string
        }
        Relationships: []
      }
      programme_templates: {
        Row: {
          created_at: string
          days_per_week: number | null
          description: string | null
          duration_weeks: number | null
          goal: string | null
          id: string
          is_public: boolean | null
          level: string | null
          name: string
          template_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days_per_week?: number | null
          description?: string | null
          duration_weeks?: number | null
          goal?: string | null
          id?: string
          is_public?: boolean | null
          level?: string | null
          name: string
          template_data: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days_per_week?: number | null
          description?: string | null
          duration_weeks?: number | null
          goal?: string | null
          id?: string
          is_public?: boolean | null
          level?: string | null
          name?: string
          template_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      programme_thread_messages: {
        Row: {
          content: string
          created_at: string
          data: Json | null
          id: string
          message_type: string
          sender_id: string
          sender_name: string
          thread_id: string
        }
        Insert: {
          content: string
          created_at?: string
          data?: Json | null
          id?: string
          message_type?: string
          sender_id: string
          sender_name: string
          thread_id: string
        }
        Update: {
          content?: string
          created_at?: string
          data?: Json | null
          id?: string
          message_type?: string
          sender_id?: string
          sender_name?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "programme_thread_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "programme_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      programme_threads: {
        Row: {
          assigned_users: string[] | null
          coach_id: string
          created_at: string
          description: string | null
          id: string
          programme_type: string
          status: string
          title: string
          updated_at: string
          weeks: number
        }
        Insert: {
          assigned_users?: string[] | null
          coach_id: string
          created_at?: string
          description?: string | null
          id?: string
          programme_type?: string
          status?: string
          title: string
          updated_at?: string
          weeks?: number
        }
        Update: {
          assigned_users?: string[] | null
          coach_id?: string
          created_at?: string
          description?: string | null
          id?: string
          programme_type?: string
          status?: string
          title?: string
          updated_at?: string
          weeks?: number
        }
        Relationships: []
      }
      progression_history: {
        Row: {
          adjustment_reason: string | null
          adjustment_type: string | null
          exercise_name: string
          id: string
          new_reps: number | null
          new_weight_kg: number | null
          previous_reps: number | null
          previous_weight_kg: number | null
          recorded_at: string
          user_id: string
        }
        Insert: {
          adjustment_reason?: string | null
          adjustment_type?: string | null
          exercise_name: string
          id?: string
          new_reps?: number | null
          new_weight_kg?: number | null
          previous_reps?: number | null
          previous_weight_kg?: number | null
          recorded_at?: string
          user_id: string
        }
        Update: {
          adjustment_reason?: string | null
          adjustment_type?: string | null
          exercise_name?: string
          id?: string
          new_reps?: number | null
          new_weight_kg?: number | null
          previous_reps?: number | null
          previous_weight_kg?: number | null
          recorded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string | null
          current_redemptions: number | null
          description: string | null
          duration_months: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_redemptions: number | null
          tier_name: string
          tokens_per_month: number
        }
        Insert: {
          code: string
          created_at?: string | null
          current_redemptions?: number | null
          description?: string | null
          duration_months?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_redemptions?: number | null
          tier_name?: string
          tokens_per_month?: number
        }
        Update: {
          code?: string
          created_at?: string | null
          current_redemptions?: number | null
          description?: string | null
          duration_months?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_redemptions?: number | null
          tier_name?: string
          tokens_per_month?: number
        }
        Relationships: []
      }
      promo_redemptions: {
        Row: {
          expires_at: string
          id: string
          promo_code_id: string
          redeemed_at: string | null
          user_id: string
        }
        Insert: {
          expires_at: string
          id?: string
          promo_code_id: string
          redeemed_at?: string | null
          user_id: string
        }
        Update: {
          expires_at?: string
          id?: string
          promo_code_id?: string
          redeemed_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_redemptions_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string
          device_label: string | null
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth_key: string
          created_at?: string
          device_label?: string | null
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth_key?: string
          created_at?: string
          device_label?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      reaction_scores: {
        Row: {
          best_reaction_ms: number
          created_at: string
          id: string
          score: number
          user_id: string
        }
        Insert: {
          best_reaction_ms?: number
          created_at?: string
          id?: string
          score?: number
          user_id: string
        }
        Update: {
          best_reaction_ms?: number
          created_at?: string
          id?: string
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          calories: number | null
          carbs_g: number | null
          fat_g: number | null
          food_id: string | null
          id: string
          name: string
          protein_g: number | null
          quantity: number | null
          recipe_id: string
          sort_order: number | null
          unit: string | null
        }
        Insert: {
          calories?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          food_id?: string | null
          id?: string
          name: string
          protein_g?: number | null
          quantity?: number | null
          recipe_id: string
          sort_order?: number | null
          unit?: string | null
        }
        Update: {
          calories?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          food_id?: string | null
          id?: string
          name?: string
          protein_g?: number | null
          quantity?: number | null
          recipe_id?: string
          sort_order?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          calories_per_serving: number | null
          carbs_g: number | null
          category: string | null
          cook_time_minutes: number | null
          cooking_method: string | null
          created_at: string
          description: string | null
          dietary_tags: string[] | null
          fat_g: number | null
          id: string
          image_url: string | null
          instructions: string | null
          is_favourite: boolean | null
          is_public: boolean | null
          name: string
          pack: string | null
          prep_time_minutes: number | null
          protein_g: number | null
          servings: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          calories_per_serving?: number | null
          carbs_g?: number | null
          category?: string | null
          cook_time_minutes?: number | null
          cooking_method?: string | null
          created_at?: string
          description?: string | null
          dietary_tags?: string[] | null
          fat_g?: number | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_favourite?: boolean | null
          is_public?: boolean | null
          name: string
          pack?: string | null
          prep_time_minutes?: number | null
          protein_g?: number | null
          servings?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          calories_per_serving?: number | null
          carbs_g?: number | null
          category?: string | null
          cook_time_minutes?: number | null
          cooking_method?: string | null
          created_at?: string
          description?: string | null
          dietary_tags?: string[] | null
          fat_g?: number | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_favourite?: boolean | null
          is_public?: boolean | null
          name?: string
          pack?: string | null
          prep_time_minutes?: number | null
          protein_g?: number | null
          servings?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          stripe_promotion_code_id: string | null
          times_used: number
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          stripe_promotion_code_id?: string | null
          times_used?: number
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          stripe_promotion_code_id?: string | null
          times_used?: number
          user_id?: string
        }
        Relationships: []
      }
      referral_signups: {
        Row: {
          created_at: string
          id: string
          referral_code_id: string
          referred_user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code_id: string
          referred_user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          referral_code_id?: string
          referred_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_signups_referral_code_id_fkey"
            columns: ["referral_code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      runs: {
        Row: {
          activity_type: string
          average_speed_kph: number | null
          calories_burned: number | null
          comments_enabled: boolean
          created_at: string
          description: string | null
          distance_km: number
          duration_seconds: number
          elevation_gain_m: number | null
          ended_at: string | null
          id: string
          is_gps_tracked: boolean | null
          is_public: boolean | null
          map_snapshot_url: string | null
          notes: string | null
          pace_per_km_seconds: number | null
          route_polyline: string | null
          started_at: string
          temperature_celsius: number | null
          title: string | null
          updated_at: string
          user_id: string
          visibility: string
          weather_conditions: string | null
        }
        Insert: {
          activity_type?: string
          average_speed_kph?: number | null
          calories_burned?: number | null
          comments_enabled?: boolean
          created_at?: string
          description?: string | null
          distance_km: number
          duration_seconds: number
          elevation_gain_m?: number | null
          ended_at?: string | null
          id?: string
          is_gps_tracked?: boolean | null
          is_public?: boolean | null
          map_snapshot_url?: string | null
          notes?: string | null
          pace_per_km_seconds?: number | null
          route_polyline?: string | null
          started_at: string
          temperature_celsius?: number | null
          title?: string | null
          updated_at?: string
          user_id: string
          visibility?: string
          weather_conditions?: string | null
        }
        Update: {
          activity_type?: string
          average_speed_kph?: number | null
          calories_burned?: number | null
          comments_enabled?: boolean
          created_at?: string
          description?: string | null
          distance_km?: number
          duration_seconds?: number
          elevation_gain_m?: number | null
          ended_at?: string | null
          id?: string
          is_gps_tracked?: boolean | null
          is_public?: boolean | null
          map_snapshot_url?: string | null
          notes?: string | null
          pace_per_km_seconds?: number | null
          route_polyline?: string | null
          started_at?: string
          temperature_celsius?: number | null
          title?: string | null
          updated_at?: string
          user_id?: string
          visibility?: string
          weather_conditions?: string | null
        }
        Relationships: []
      }
      saved_foods: {
        Row: {
          barcode: string | null
          brand: string | null
          calories: number
          carbs_g: number | null
          created_at: string
          fat_g: number | null
          fiber_g: number | null
          food_name: string
          id: string
          is_favourite: boolean | null
          last_used_at: string | null
          protein_g: number | null
          quantity_remaining: number | null
          quantity_unit: string | null
          serving_size: string | null
          sodium_mg: number | null
          sugar_g: number | null
          updated_at: string
          use_count: number | null
          user_id: string
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          calories: number
          carbs_g?: number | null
          created_at?: string
          fat_g?: number | null
          fiber_g?: number | null
          food_name: string
          id?: string
          is_favourite?: boolean | null
          last_used_at?: string | null
          protein_g?: number | null
          quantity_remaining?: number | null
          quantity_unit?: string | null
          serving_size?: string | null
          sodium_mg?: number | null
          sugar_g?: number | null
          updated_at?: string
          use_count?: number | null
          user_id: string
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          calories?: number
          carbs_g?: number | null
          created_at?: string
          fat_g?: number | null
          fiber_g?: number | null
          food_name?: string
          id?: string
          is_favourite?: boolean | null
          last_used_at?: string | null
          protein_g?: number | null
          quantity_remaining?: number | null
          quantity_unit?: string | null
          serving_size?: string | null
          sodium_mg?: number | null
          sugar_g?: number | null
          updated_at?: string
          use_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      saved_posts: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      segment_efforts: {
        Row: {
          created_at: string
          elapsed_time_seconds: number
          end_index: number | null
          id: string
          is_kom: boolean | null
          is_pr: boolean | null
          rank: number | null
          run_id: string | null
          segment_id: string
          start_index: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          elapsed_time_seconds: number
          end_index?: number | null
          id?: string
          is_kom?: boolean | null
          is_pr?: boolean | null
          rank?: number | null
          run_id?: string | null
          segment_id: string
          start_index?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          elapsed_time_seconds?: number
          end_index?: number | null
          id?: string
          is_kom?: boolean | null
          is_pr?: boolean | null
          rank?: number | null
          run_id?: string | null
          segment_id?: string
          start_index?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "segment_efforts_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "segment_efforts_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "segments"
            referencedColumns: ["id"]
          },
        ]
      }
      segments: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          distance_m: number
          elevation_gain_m: number | null
          end_lat: number
          end_lng: number
          id: string
          name: string
          polyline: string
          start_lat: number
          start_lng: number
          total_efforts: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          distance_m: number
          elevation_gain_m?: number | null
          end_lat: number
          end_lng: number
          id?: string
          name: string
          polyline: string
          start_lat: number
          start_lng: number
          total_efforts?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          distance_m?: number
          elevation_gain_m?: number | null
          end_lat?: number
          end_lng?: number
          id?: string
          name?: string
          polyline?: string
          start_lat?: number
          start_lng?: number
          total_efforts?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      session_planners: {
        Row: {
          cooldown: string | null
          created_at: string
          day_number: number
          id: string
          notes: string | null
          planned_exercises: Json
          program_id: string | null
          scheduled_date: string | null
          session_type: string
          status: string | null
          updated_at: string
          user_id: string
          warmup: string | null
          week_number: number
        }
        Insert: {
          cooldown?: string | null
          created_at?: string
          day_number: number
          id?: string
          notes?: string | null
          planned_exercises: Json
          program_id?: string | null
          scheduled_date?: string | null
          session_type: string
          status?: string | null
          updated_at?: string
          user_id: string
          warmup?: string | null
          week_number: number
        }
        Update: {
          cooldown?: string | null
          created_at?: string
          day_number?: number
          id?: string
          notes?: string | null
          planned_exercises?: Json
          program_id?: string | null
          scheduled_date?: string | null
          session_type?: string
          status?: string | null
          updated_at?: string
          user_id?: string
          warmup?: string | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "session_planners_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      snake_scores: {
        Row: {
          created_at: string
          id: string
          score: number
          theme_shifts: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          score?: number
          theme_shifts?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          score?: number
          theme_shifts?: number
          user_id?: string
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          coach_name: string | null
          comments_count: number | null
          content: string
          content_type: string
          context: string | null
          created_at: string
          custom_image_url: string | null
          custom_video_url: string | null
          engagement_rate: number | null
          id: string
          image_prompt: string | null
          image_url: string | null
          impressions: number | null
          inspiration: string | null
          last_synced_at: string | null
          likes: number | null
          meta_post_id: string | null
          meta_status: string | null
          music_suggestion: string | null
          music_track_id: string | null
          platform: string
          publish_error: string | null
          published_at: string | null
          reach: number | null
          saves: number | null
          scheduled_at: string | null
          script: string | null
          shares: number | null
          status: string
          tone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          coach_name?: string | null
          comments_count?: number | null
          content: string
          content_type: string
          context?: string | null
          created_at?: string
          custom_image_url?: string | null
          custom_video_url?: string | null
          engagement_rate?: number | null
          id?: string
          image_prompt?: string | null
          image_url?: string | null
          impressions?: number | null
          inspiration?: string | null
          last_synced_at?: string | null
          likes?: number | null
          meta_post_id?: string | null
          meta_status?: string | null
          music_suggestion?: string | null
          music_track_id?: string | null
          platform: string
          publish_error?: string | null
          published_at?: string | null
          reach?: number | null
          saves?: number | null
          scheduled_at?: string | null
          script?: string | null
          shares?: number | null
          status?: string
          tone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          coach_name?: string | null
          comments_count?: number | null
          content?: string
          content_type?: string
          context?: string | null
          created_at?: string
          custom_image_url?: string | null
          custom_video_url?: string | null
          engagement_rate?: number | null
          id?: string
          image_prompt?: string | null
          image_url?: string | null
          impressions?: number | null
          inspiration?: string | null
          last_synced_at?: string | null
          likes?: number | null
          meta_post_id?: string | null
          meta_status?: string | null
          music_suggestion?: string | null
          music_track_id?: string | null
          platform?: string
          publish_error?: string | null
          published_at?: string | null
          reach?: number | null
          saves?: number | null
          scheduled_at?: string | null
          script?: string | null
          shares?: number | null
          status?: string
          tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_music_track_id_fkey"
            columns: ["music_track_id"]
            isOneToOne: false
            referencedRelation: "un_tunes_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      space_invaders_scores: {
        Row: {
          created_at: string
          id: string
          score: number
          theme_shifts: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          score?: number
          theme_shifts?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          score?: number
          theme_shifts?: number
          user_id?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          background_color: string | null
          content: string | null
          created_at: string
          expires_at: string
          id: string
          image_url: string | null
          media_items: Json | null
          text_overlays: Json | null
          user_id: string
          video_url: string | null
          visibility: string
        }
        Insert: {
          background_color?: string | null
          content?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          image_url?: string | null
          media_items?: Json | null
          text_overlays?: Json | null
          user_id: string
          video_url?: string | null
          visibility?: string
        }
        Update: {
          background_color?: string | null
          content?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          image_url?: string | null
          media_items?: Json | null
          text_overlays?: Json | null
          user_id?: string
          video_url?: string | null
          visibility?: string
        }
        Relationships: []
      }
      tetris_scores: {
        Row: {
          created_at: string
          id: string
          level: number
          lines_cleared: number
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: number
          lines_cleared?: number
          score?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: number
          lines_cleared?: number
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      token_balances: {
        Row: {
          balance: number
          created_at: string | null
          current_tier: string | null
          lifetime_earned: number
          lifetime_spent: number
          stripe_subscription_id: string | null
          tier_renews_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string | null
          current_tier?: string | null
          lifetime_earned?: number
          lifetime_spent?: number
          stripe_subscription_id?: string | null
          tier_renews_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string | null
          current_tier?: string | null
          lifetime_earned?: number
          lifetime_spent?: number
          stripe_subscription_id?: string | null
          tier_renews_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_balances_current_tier_fkey"
            columns: ["current_tier"]
            isOneToOne: false
            referencedRelation: "ai_tiers"
            referencedColumns: ["name"]
          },
        ]
      }
      token_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      training_programs: {
        Row: {
          auto_track_enabled: boolean
          created_at: string
          current_day: number | null
          current_week: number | null
          id: string
          is_active: boolean
          name: string
          overview: string | null
          program_data: Json
          started_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_track_enabled?: boolean
          created_at?: string
          current_day?: number | null
          current_week?: number | null
          id?: string
          is_active?: boolean
          name: string
          overview?: string | null
          program_data: Json
          started_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_track_enabled?: boolean
          created_at?: string
          current_day?: number | null
          current_week?: number | null
          id?: string
          is_active?: boolean
          name?: string
          overview?: string | null
          program_data?: Json
          started_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trophies: {
        Row: {
          age_group: string | null
          category: string
          created_at: string
          distance_bucket: string
          earned_at: string
          id: string
          pace_per_km_seconds: number
          rank: number
          run_id: string | null
          user_id: string
        }
        Insert: {
          age_group?: string | null
          category: string
          created_at?: string
          distance_bucket: string
          earned_at?: string
          id?: string
          pace_per_km_seconds: number
          rank: number
          run_id?: string | null
          user_id: string
        }
        Update: {
          age_group?: string | null
          category?: string
          created_at?: string
          distance_bucket?: string
          earned_at?: string
          id?: string
          pace_per_km_seconds?: number
          rank?: number
          run_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      un_tunes_albums: {
        Row: {
          album_type: string | null
          artist_id: string
          cover_url: string | null
          created_at: string | null
          description: string | null
          genre: string | null
          id: string
          is_free: boolean | null
          price_gbp: number | null
          release_date: string | null
          title: string
          total_tracks: number | null
        }
        Insert: {
          album_type?: string | null
          artist_id: string
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          genre?: string | null
          id?: string
          is_free?: boolean | null
          price_gbp?: number | null
          release_date?: string | null
          title: string
          total_tracks?: number | null
        }
        Update: {
          album_type?: string | null
          artist_id?: string
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          genre?: string | null
          id?: string
          is_free?: boolean | null
          price_gbp?: number | null
          release_date?: string | null
          title?: string
          total_tracks?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "un_tunes_albums_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "un_tunes_artists"
            referencedColumns: ["id"]
          },
        ]
      }
      un_tunes_artists: {
        Row: {
          artist_name: string
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          created_at: string | null
          follower_count: number | null
          genre: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          monthly_listeners: number | null
          social_instagram: string | null
          social_twitter: string | null
          social_website: string | null
          stripe_account_id: string | null
          total_plays: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          artist_name: string
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          follower_count?: number | null
          genre?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          monthly_listeners?: number | null
          social_instagram?: string | null
          social_twitter?: string | null
          social_website?: string | null
          stripe_account_id?: string | null
          total_plays?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          artist_name?: string
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          follower_count?: number | null
          genre?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          monthly_listeners?: number | null
          social_instagram?: string | null
          social_twitter?: string | null
          social_website?: string | null
          stripe_account_id?: string | null
          total_plays?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      un_tunes_bids: {
        Row: {
          amount: number
          bidder_id: string
          created_at: string
          id: string
          listing_id: string
        }
        Insert: {
          amount: number
          bidder_id: string
          created_at?: string
          id?: string
          listing_id: string
        }
        Update: {
          amount?: number
          bidder_id?: string
          created_at?: string
          id?: string
          listing_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "un_tunes_bids_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "un_tunes_card_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      un_tunes_brand_cards: {
        Row: {
          artwork_url: string | null
          created_at: string
          description: string | null
          drop_rate_diamond: number
          drop_rate_gold: number
          drop_rate_standard: number
          editions_issued: number | null
          id: string
          max_diamond: number
          max_gold: number
          max_platinum: number | null
          max_standard: number
          pack_only: boolean | null
          platinum_only: boolean | null
          slug: string
          stripe_price_id: string | null
          stripe_product_id: string | null
          title: string
        }
        Insert: {
          artwork_url?: string | null
          created_at?: string
          description?: string | null
          drop_rate_diamond?: number
          drop_rate_gold?: number
          drop_rate_standard?: number
          editions_issued?: number | null
          id?: string
          max_diamond?: number
          max_gold?: number
          max_platinum?: number | null
          max_standard?: number
          pack_only?: boolean | null
          platinum_only?: boolean | null
          slug: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          title: string
        }
        Update: {
          artwork_url?: string | null
          created_at?: string
          description?: string | null
          drop_rate_diamond?: number
          drop_rate_gold?: number
          drop_rate_standard?: number
          editions_issued?: number | null
          id?: string
          max_diamond?: number
          max_gold?: number
          max_platinum?: number | null
          max_standard?: number
          pack_only?: boolean | null
          platinum_only?: boolean | null
          slug?: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          title?: string
        }
        Relationships: []
      }
      un_tunes_card_listings: {
        Row: {
          buy_now_price: number | null
          card_id: string
          created_at: string
          current_bid: number
          current_bidder_id: string | null
          ends_at: string
          id: string
          listing_type: string
          seller_id: string
          starting_price: number
          status: string
          updated_at: string
        }
        Insert: {
          buy_now_price?: number | null
          card_id: string
          created_at?: string
          current_bid?: number
          current_bidder_id?: string | null
          ends_at: string
          id?: string
          listing_type?: string
          seller_id: string
          starting_price?: number
          status?: string
          updated_at?: string
        }
        Update: {
          buy_now_price?: number | null
          card_id?: string
          created_at?: string
          current_bid?: number
          current_bidder_id?: string | null
          ends_at?: string
          id?: string
          listing_type?: string
          seller_id?: string
          starting_price?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "un_tunes_card_listings_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "un_tunes_user_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      un_tunes_follows: {
        Row: {
          artist_id: string
          followed_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          artist_id: string
          followed_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          artist_id?: string
          followed_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "un_tunes_follows_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "un_tunes_artists"
            referencedColumns: ["id"]
          },
        ]
      }
      un_tunes_likes: {
        Row: {
          id: string
          liked_at: string | null
          track_id: string
          user_id: string
        }
        Insert: {
          id?: string
          liked_at?: string | null
          track_id: string
          user_id: string
        }
        Update: {
          id?: string
          liked_at?: string | null
          track_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "un_tunes_likes_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "un_tunes_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      un_tunes_lyric_cards: {
        Row: {
          artwork_url: string | null
          created_at: string
          id: string
          lyric_text: string
          track_id: string
        }
        Insert: {
          artwork_url?: string | null
          created_at?: string
          id?: string
          lyric_text: string
          track_id: string
        }
        Update: {
          artwork_url?: string | null
          created_at?: string
          id?: string
          lyric_text?: string
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "un_tunes_lyric_cards_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: true
            referencedRelation: "un_tunes_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      un_tunes_playlist_items: {
        Row: {
          added_at: string | null
          id: string
          playlist_id: string
          position: number | null
          track_id: string
        }
        Insert: {
          added_at?: string | null
          id?: string
          playlist_id: string
          position?: number | null
          track_id: string
        }
        Update: {
          added_at?: string | null
          id?: string
          playlist_id?: string
          position?: number | null
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "un_tunes_playlist_items_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "un_tunes_playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "un_tunes_playlist_items_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "un_tunes_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      un_tunes_playlists: {
        Row: {
          cover_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          track_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          track_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          track_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      un_tunes_plays: {
        Row: {
          duration_listened: number | null
          id: string
          played_at: string | null
          track_id: string
          user_id: string | null
        }
        Insert: {
          duration_listened?: number | null
          id?: string
          played_at?: string | null
          track_id: string
          user_id?: string | null
        }
        Update: {
          duration_listened?: number | null
          id?: string
          played_at?: string | null
          track_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "un_tunes_plays_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "un_tunes_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      un_tunes_price_history: {
        Row: {
          card_type: string
          id: string
          rarity: string
          reference_id: string | null
          sale_price: number
          sale_type: string
          sold_at: string
        }
        Insert: {
          card_type: string
          id?: string
          rarity: string
          reference_id?: string | null
          sale_price: number
          sale_type: string
          sold_at?: string
        }
        Update: {
          card_type?: string
          id?: string
          rarity?: string
          reference_id?: string | null
          sale_price?: number
          sale_type?: string
          sold_at?: string
        }
        Relationships: []
      }
      un_tunes_purchases: {
        Row: {
          album_id: string | null
          amount_gbp: number
          created_at: string | null
          id: string
          purchase_type: string | null
          purchased_at: string | null
          stripe_payment_id: string | null
          tokens_spent: number | null
          track_id: string | null
          user_id: string
        }
        Insert: {
          album_id?: string | null
          amount_gbp: number
          created_at?: string | null
          id?: string
          purchase_type?: string | null
          purchased_at?: string | null
          stripe_payment_id?: string | null
          tokens_spent?: number | null
          track_id?: string | null
          user_id: string
        }
        Update: {
          album_id?: string | null
          amount_gbp?: number
          created_at?: string | null
          id?: string
          purchase_type?: string | null
          purchased_at?: string | null
          stripe_payment_id?: string | null
          tokens_spent?: number | null
          track_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "un_tunes_purchases_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "un_tunes_albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "un_tunes_purchases_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "un_tunes_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      un_tunes_tracks: {
        Row: {
          album_id: string | null
          artist_id: string
          audio_url: string | null
          bpm: number | null
          cover_url: string | null
          created_at: string | null
          duration_seconds: number | null
          genre: string | null
          id: string
          is_free: boolean | null
          like_count: number | null
          lyrics: string | null
          pillar: string | null
          play_count: number | null
          price_gbp: number | null
          tags: string[] | null
          title: string
          track_number: number | null
          track_type: string | null
        }
        Insert: {
          album_id?: string | null
          artist_id: string
          audio_url?: string | null
          bpm?: number | null
          cover_url?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          genre?: string | null
          id?: string
          is_free?: boolean | null
          like_count?: number | null
          lyrics?: string | null
          pillar?: string | null
          play_count?: number | null
          price_gbp?: number | null
          tags?: string[] | null
          title: string
          track_number?: number | null
          track_type?: string | null
        }
        Update: {
          album_id?: string | null
          artist_id?: string
          audio_url?: string | null
          bpm?: number | null
          cover_url?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          genre?: string | null
          id?: string
          is_free?: boolean | null
          like_count?: number | null
          lyrics?: string | null
          pillar?: string | null
          play_count?: number | null
          price_gbp?: number | null
          tags?: string[] | null
          title?: string
          track_number?: number | null
          track_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "un_tunes_tracks_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "un_tunes_albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "un_tunes_tracks_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "un_tunes_artists"
            referencedColumns: ["id"]
          },
        ]
      }
      un_tunes_trades: {
        Row: {
          created_at: string
          id: string
          proposer_card_id: string
          proposer_id: string
          receiver_card_id: string
          receiver_id: string
          resolved_at: string | null
          status: string
          tokens_offered: number
        }
        Insert: {
          created_at?: string
          id?: string
          proposer_card_id: string
          proposer_id: string
          receiver_card_id: string
          receiver_id: string
          resolved_at?: string | null
          status?: string
          tokens_offered?: number
        }
        Update: {
          created_at?: string
          id?: string
          proposer_card_id?: string
          proposer_id?: string
          receiver_card_id?: string
          receiver_id?: string
          resolved_at?: string | null
          status?: string
          tokens_offered?: number
        }
        Relationships: [
          {
            foreignKeyName: "un_tunes_trades_proposer_card_id_fkey"
            columns: ["proposer_card_id"]
            isOneToOne: false
            referencedRelation: "un_tunes_user_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "un_tunes_trades_receiver_card_id_fkey"
            columns: ["receiver_card_id"]
            isOneToOne: false
            referencedRelation: "un_tunes_user_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      un_tunes_user_cards: {
        Row: {
          album_id: string | null
          brand_card_id: string | null
          card_type: string
          created_at: string
          date_stamped: string | null
          edition_number: number
          id: string
          is_opened: boolean
          lyric_card_id: string | null
          opened_at: string | null
          purchase_id: string | null
          purchased: boolean | null
          rarity: string
          track_id: string | null
          user_id: string
        }
        Insert: {
          album_id?: string | null
          brand_card_id?: string | null
          card_type?: string
          created_at?: string
          date_stamped?: string | null
          edition_number?: number
          id?: string
          is_opened?: boolean
          lyric_card_id?: string | null
          opened_at?: string | null
          purchase_id?: string | null
          purchased?: boolean | null
          rarity?: string
          track_id?: string | null
          user_id: string
        }
        Update: {
          album_id?: string | null
          brand_card_id?: string | null
          card_type?: string
          created_at?: string
          date_stamped?: string | null
          edition_number?: number
          id?: string
          is_opened?: boolean
          lyric_card_id?: string | null
          opened_at?: string | null
          purchase_id?: string | null
          purchased?: boolean | null
          rarity?: string
          track_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "un_tunes_user_cards_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "un_tunes_albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "un_tunes_user_cards_brand_card_id_fkey"
            columns: ["brand_card_id"]
            isOneToOne: false
            referencedRelation: "un_tunes_brand_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "un_tunes_user_cards_lyric_card_id_fkey"
            columns: ["lyric_card_id"]
            isOneToOne: false
            referencedRelation: "un_tunes_lyric_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "un_tunes_user_cards_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "un_tunes_purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "un_tunes_user_cards_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "un_tunes_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      unbreakable86_daily_logs: {
        Row: {
          all_habits_done: boolean
          created_at: string
          day_number: number
          education_completed: boolean
          education_content_id: string | null
          enrolment_id: string
          habit_breathwork: boolean
          habit_cold_shower: boolean
          habit_hydrate: boolean
          habit_learn: boolean
          habit_numbers: boolean
          habit_sauna: boolean
          habit_train: boolean
          id: string
          journal: string | null
          log_date: string
          updated_at: string
          user_id: string
          water_glasses: number
        }
        Insert: {
          all_habits_done?: boolean
          created_at?: string
          day_number: number
          education_completed?: boolean
          education_content_id?: string | null
          enrolment_id: string
          habit_breathwork?: boolean
          habit_cold_shower?: boolean
          habit_hydrate?: boolean
          habit_learn?: boolean
          habit_numbers?: boolean
          habit_sauna?: boolean
          habit_train?: boolean
          id?: string
          journal?: string | null
          log_date: string
          updated_at?: string
          user_id: string
          water_glasses?: number
        }
        Update: {
          all_habits_done?: boolean
          created_at?: string
          day_number?: number
          education_completed?: boolean
          education_content_id?: string | null
          enrolment_id?: string
          habit_breathwork?: boolean
          habit_cold_shower?: boolean
          habit_hydrate?: boolean
          habit_learn?: boolean
          habit_numbers?: boolean
          habit_sauna?: boolean
          habit_train?: boolean
          id?: string
          journal?: string | null
          log_date?: string
          updated_at?: string
          user_id?: string
          water_glasses?: number
        }
        Relationships: [
          {
            foreignKeyName: "unbreakable86_daily_logs_enrolment_id_fkey"
            columns: ["enrolment_id"]
            isOneToOne: false
            referencedRelation: "unbreakable86_enrolments"
            referencedColumns: ["id"]
          },
        ]
      }
      unbreakable86_enrolments: {
        Row: {
          certificate_sent_at: string | null
          completed_at: string | null
          created_at: string
          current_day: number
          id: string
          programme_id: string | null
          quiz_answers: Json | null
          reset_count: number
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          certificate_sent_at?: string | null
          completed_at?: string | null
          created_at?: string
          current_day?: number
          id?: string
          programme_id?: string | null
          quiz_answers?: Json | null
          reset_count?: number
          start_date?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          certificate_sent_at?: string | null
          completed_at?: string | null
          created_at?: string
          current_day?: number
          id?: string
          programme_id?: string | null
          quiz_answers?: Json | null
          reset_count?: number
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      university_assessments: {
        Row: {
          answers: Json
          attempted_at: string
          course_type: string
          id: string
          is_final: boolean
          level: number
          passed: boolean
          score: number
          total: number
          unit_number: number
          user_id: string
        }
        Insert: {
          answers?: Json
          attempted_at?: string
          course_type?: string
          id?: string
          is_final?: boolean
          level: number
          passed?: boolean
          score: number
          total: number
          unit_number: number
          user_id: string
        }
        Update: {
          answers?: Json
          attempted_at?: string
          course_type?: string
          id?: string
          is_final?: boolean
          level?: number
          passed?: boolean
          score?: number
          total?: number
          unit_number?: number
          user_id?: string
        }
        Relationships: []
      }
      university_chapter_quizzes: {
        Row: {
          answers: Json
          attempted_at: string
          chapter_number: number
          course_type: string
          id: string
          level: number
          passed: boolean
          score: number
          total: number
          unit_number: number
          user_id: string
        }
        Insert: {
          answers?: Json
          attempted_at?: string
          chapter_number: number
          course_type?: string
          id?: string
          level: number
          passed?: boolean
          score: number
          total: number
          unit_number: number
          user_id: string
        }
        Update: {
          answers?: Json
          attempted_at?: string
          chapter_number?: number
          course_type?: string
          id?: string
          level?: number
          passed?: boolean
          score?: number
          total?: number
          unit_number?: number
          user_id?: string
        }
        Relationships: []
      }
      university_progress: {
        Row: {
          chapter_number: number
          completed_at: string
          course_type: string
          id: string
          level: number
          unit_number: number
          user_id: string
        }
        Insert: {
          chapter_number: number
          completed_at?: string
          course_type?: string
          id?: string
          level: number
          unit_number: number
          user_id: string
        }
        Update: {
          chapter_number?: number
          completed_at?: string
          course_type?: string
          id?: string
          level?: number
          unit_number?: number
          user_id?: string
        }
        Relationships: []
      }
      user_ai_preferences: {
        Row: {
          auto_progression_enabled: boolean | null
          created_at: string
          feedback_frequency: string | null
          id: string
          movement_analysis_enabled: boolean | null
          updated_at: string
          user_id: string
          voice_feedback_enabled: boolean | null
          voice_gender: string | null
        }
        Insert: {
          auto_progression_enabled?: boolean | null
          created_at?: string
          feedback_frequency?: string | null
          id?: string
          movement_analysis_enabled?: boolean | null
          updated_at?: string
          user_id: string
          voice_feedback_enabled?: boolean | null
          voice_gender?: string | null
        }
        Update: {
          auto_progression_enabled?: boolean | null
          created_at?: string
          feedback_frequency?: string | null
          id?: string
          movement_analysis_enabled?: boolean | null
          updated_at?: string
          user_id?: string
          voice_feedback_enabled?: boolean | null
          voice_gender?: string | null
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          is_online: boolean
          last_seen: string
          user_id: string
        }
        Insert: {
          is_online?: boolean
          last_seen?: string
          user_id: string
        }
        Update: {
          is_online?: boolean
          last_seen?: string
          user_id?: string
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          reason: string
          reported_content_id: string | null
          reported_content_type: string | null
          reported_user_id: string
          reporter_id: string | null
          resolution_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          reason: string
          reported_content_id?: string | null
          reported_content_type?: string | null
          reported_user_id: string
          reporter_id?: string | null
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          reason?: string
          reported_content_id?: string | null
          reported_content_type?: string | null
          reported_user_id?: string
          reporter_id?: string | null
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          ai_feedback_enabled: boolean | null
          allow_comments_default: boolean | null
          allow_friend_requests: boolean | null
          allow_messages: string | null
          cardio_voice_enabled: boolean
          created_at: string
          default_stream_visibility: string | null
          id: string
          live_notifications_enabled: boolean | null
          motivational_popups_enabled: boolean
          notify_achievements: boolean | null
          notify_comments: boolean | null
          notify_friend_requests: boolean | null
          notify_likes: boolean | null
          notify_messages: boolean | null
          profile_visibility: string | null
          show_achievements_in_feed: boolean | null
          show_community_posts: boolean | null
          show_online_status: boolean | null
          show_stats_publicly: boolean | null
          stream_quality: string | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_feedback_enabled?: boolean | null
          allow_comments_default?: boolean | null
          allow_friend_requests?: boolean | null
          allow_messages?: string | null
          cardio_voice_enabled?: boolean
          created_at?: string
          default_stream_visibility?: string | null
          id?: string
          live_notifications_enabled?: boolean | null
          motivational_popups_enabled?: boolean
          notify_achievements?: boolean | null
          notify_comments?: boolean | null
          notify_friend_requests?: boolean | null
          notify_likes?: boolean | null
          notify_messages?: boolean | null
          profile_visibility?: string | null
          show_achievements_in_feed?: boolean | null
          show_community_posts?: boolean | null
          show_online_status?: boolean | null
          show_stats_publicly?: boolean | null
          stream_quality?: string | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_feedback_enabled?: boolean | null
          allow_comments_default?: boolean | null
          allow_friend_requests?: boolean | null
          allow_messages?: string | null
          cardio_voice_enabled?: boolean
          created_at?: string
          default_stream_visibility?: string | null
          id?: string
          live_notifications_enabled?: boolean | null
          motivational_popups_enabled?: boolean
          notify_achievements?: boolean | null
          notify_comments?: boolean | null
          notify_friend_requests?: boolean | null
          notify_likes?: boolean | null
          notify_messages?: boolean | null
          profile_visibility?: string | null
          show_achievements_in_feed?: boolean | null
          show_community_posts?: boolean | null
          show_online_status?: boolean | null
          show_stats_publicly?: boolean | null
          stream_quality?: string | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_suspensions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_permanent: boolean | null
          lifted_at: string | null
          lifted_by: string | null
          reason: string
          suspended_at: string | null
          suspended_by: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_permanent?: boolean | null
          lifted_at?: string | null
          lifted_by?: string | null
          reason: string
          suspended_at?: string | null
          suspended_by: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_permanent?: boolean | null
          lifted_at?: string | null
          lifted_by?: string | null
          reason?: string
          suspended_at?: string | null
          suspended_by?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_progress_snapshots: {
        Row: {
          created_at: string | null
          exercises_improved: Json | null
          id: string
          pack_awarded: boolean | null
          pbs_broken: Json | null
          sessions_completed: number | null
          total_volume_kg: number | null
          user_id: string
          week_end: string
          week_start: string
        }
        Insert: {
          created_at?: string | null
          exercises_improved?: Json | null
          id?: string
          pack_awarded?: boolean | null
          pbs_broken?: Json | null
          sessions_completed?: number | null
          total_volume_kg?: number | null
          user_id: string
          week_end: string
          week_start: string
        }
        Update: {
          created_at?: string | null
          exercises_improved?: Json | null
          id?: string
          pack_awarded?: boolean | null
          pbs_broken?: Json | null
          sessions_completed?: number | null
          total_volume_kg?: number | null
          user_id?: string
          week_end?: string
          week_start?: string
        }
        Relationships: []
      }
      word_chain_scores: {
        Row: {
          created_at: string
          id: string
          longest_word: string | null
          max_chain: number
          score: number
          user_id: string
          words_found: number
        }
        Insert: {
          created_at?: string
          id?: string
          longest_word?: string | null
          max_chain?: number
          score?: number
          user_id: string
          words_found?: number
        }
        Update: {
          created_at?: string
          id?: string
          longest_word?: string | null
          max_chain?: number
          score?: number
          user_id?: string
          words_found?: number
        }
        Relationships: []
      }
      workout_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
          workout_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          workout_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_comments_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_feedback: {
        Row: {
          content: string
          created_at: string
          fatigue_score: number | null
          feedback_type: string
          id: string
          performance_rating: string | null
          session_id: string | null
          suggestions: Json | null
          user_id: string
          voice_url: string | null
        }
        Insert: {
          content: string
          created_at?: string
          fatigue_score?: number | null
          feedback_type: string
          id?: string
          performance_rating?: string | null
          session_id?: string | null
          suggestions?: Json | null
          user_id: string
          voice_url?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          fatigue_score?: number | null
          feedback_type?: string
          id?: string
          performance_rating?: string | null
          session_id?: string | null
          suggestions?: Json | null
          user_id?: string
          voice_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_feedback_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_kudos: {
        Row: {
          created_at: string
          id: string
          user_id: string
          workout_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          workout_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_kudos_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          comments_enabled: boolean
          created_at: string
          day_name: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          is_auto_tracked: boolean
          media_urls: Json | null
          notes: string | null
          program_id: string | null
          session_type: string
          started_at: string
          status: string
          updated_at: string
          user_id: string
          visibility: string
          week_number: number
        }
        Insert: {
          comments_enabled?: boolean
          created_at?: string
          day_name: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          is_auto_tracked?: boolean
          media_urls?: Json | null
          notes?: string | null
          program_id?: string | null
          session_type: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
          visibility?: string
          week_number: number
        }
        Update: {
          comments_enabled?: boolean
          created_at?: string
          day_name?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          is_auto_tracked?: boolean
          media_urls?: Json | null
          notes?: string | null
          program_id?: string | null
          session_type?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
          visibility?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      pb_leaderboard: {
        Row: {
          achieved_at: string | null
          age_category: string | null
          avatar_url: string | null
          display_name: string | null
          estimated_1rm: number | null
          exercise_name: string | null
          percentile: number | null
          rank_in_category: number | null
          total_in_category: number | null
          user_id: string | null
        }
        Relationships: []
      }
      run_pb_leaderboard: {
        Row: {
          achieved_at: string | null
          age_category: string | null
          avatar_url: string | null
          display_name: string | null
          distance_km: number | null
          distance_type: string | null
          pace_per_km_seconds: number | null
          percentile: number | null
          rank_in_category: number | null
          time_seconds: number | null
          total_in_category: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      are_friends: { Args: { user1: string; user2: string }; Returns: boolean }
      auto_fill_daily_habits: { Args: { _user_id?: string }; Returns: Json }
      award_pb_card:
        | {
            Args: {
              p_activity_category?: string
              p_distance_type?: string
              p_exercise_name?: string
              p_rank?: number
              p_source_run_id?: string
              p_source_session_id?: string
              p_unit?: string
              p_user_id: string
              p_value?: number
            }
            Returns: string
          }
        | {
            Args: {
              p_activity_category?: string
              p_distance_type?: string
              p_exercise_name?: string
              p_is_auto?: boolean
              p_rank?: number
              p_source_run_id?: string
              p_source_session_id?: string
              p_unit?: string
              p_user_id: string
              p_value?: number
            }
            Returns: string
          }
      award_programme_trophy: {
        Args: {
          p_completion_count?: number
          p_programme_name: string
          p_user_id: string
        }
        Returns: string
      }
      buy_now_card: { Args: { p_listing_id: string }; Returns: Json }
      buy_now_listing: {
        Args: { _listing_id: string; _uid: string }
        Returns: Json
      }
      calculate_athlete_stats: { Args: { p_user_id: string }; Returns: Json }
      calculate_pb_card_stats: {
        Args: {
          p_activity?: string
          p_exercise_name?: string
          p_user_id: string
        }
        Returns: Json
      }
      can_message_user: {
        Args: { recipient_id: string; sender_id: string }
        Returns: boolean
      }
      cancel_listing: { Args: { p_listing_id: string }; Returns: Json }
      check_booking_limit: {
        Args: { p_coach_id: string; p_date: string; p_user_id: string }
        Returns: boolean
      }
      check_global_pb_ranking: {
        Args: {
          p_activity_category?: string
          p_distance_type?: string
          p_exercise_name?: string
          p_user_id: string
        }
        Returns: undefined
      }
      claim_brand_edition: {
        Args: { p_brand_card_id: string; p_rarity: string }
        Returns: number
      }
      claim_diamond_edition: {
        Args: { p_album_id?: string; p_track_id?: string }
        Returns: number
      }
      complete_auction: { Args: { p_listing_id: string }; Returns: Json }
      create_card_listing:
        | {
            Args: {
              _buy_now_price?: number
              _card_id: string
              _duration_hours?: number
              _listing_type?: string
              _starting_price?: number
              _uid: string
            }
            Returns: Json
          }
        | {
            Args: {
              _buy_now_price?: number
              _card_id: string
              _duration_hours?: number
              _listing_type?: string
              _starting_price?: number
              _uid: string
            }
            Returns: Json
          }
      create_coaching_booking: {
        Args: {
          p_block_type?: string
          p_coach_id: string
          p_service_type: string
          p_session_date?: string
          p_session_time?: string
        }
        Returns: Json
      }
      deduct_token: {
        Args: {
          p_amount?: number
          p_description?: string
          p_function_name?: string
          p_user_id: string
        }
        Returns: number
      }
      deduct_tokens: {
        Args: {
          _amount?: number
          p_amount?: number
          p_reason?: string
          p_user_id?: string
        }
        Returns: Json
      }
      discard_card:
        | {
            Args: { _card_id: string; _force?: boolean; _uid: string }
            Returns: Json
          }
        | { Args: { p_card_id: string }; Returns: Json }
      get_achievement_collection: {
        Args: { p_user_id: string }
        Returns: {
          activity_category: string
          age_category: string
          athlete_stats: Json
          bio_line: string
          card_number: string
          card_type: string
          category_label: string
          completion_count: number
          distance_type: string
          earned_at: string
          exercise_name: string
          global_rank_pct: number
          id: string
          image_url: string
          media_type: string
          overall_rating: number
          programme_name: string
          programme_type: string
          purchased: boolean
          rarity: string
          record_unit: string
          record_value: number
          subtitle: string
          title: string
          video_url: string
        }[]
      }
      get_athlete_stats: { Args: { p_user_id: string }; Returns: Json }
      get_coach_calendar: {
        Args: { _coach_id: string; _end: string; _start: string }
        Returns: Json
      }
      get_feed_posts: {
        Args: { p_limit?: number; p_offset?: number; p_user_id?: string }
        Returns: Json[]
      }
      get_customer_success_member_context: {
        Args: { p_member_user_id: string }
        Returns: Json
      }
      get_founder_dashboard_metrics: {
        Args: {
          p_end: string
          p_prev_end?: string
          p_prev_start?: string
          p_start: string
        }
        Returns: Json
      }
      get_my_cards: {
        Args: { _uid?: string }
        Returns: {
          album_id: string | null
          brand_card_id: string | null
          card_type: string
          created_at: string
          date_stamped: string | null
          edition_number: number
          id: string
          is_opened: boolean
          lyric_card_id: string | null
          opened_at: string | null
          purchase_id: string | null
          purchased: boolean | null
          rarity: string
          track_id: string | null
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "un_tunes_user_cards"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_my_duplicate_cards: {
        Args: { _uid: string }
        Returns: {
          card_count: number
          card_ids: string[]
          cover_url: string
          item_key: string
          rarity: string
          title: string
        }[]
      }
      get_my_owned_track_ids: {
        Args: never
        Returns: {
          track_id: string
        }[]
      }
      get_or_create_referral_code: {
        Args: { p_user_id: string }
        Returns: string
      }
      get_token_balance: { Args: never; Returns: number }
      grant_monthly_tokens: { Args: { p_user_id: string }; Returns: number }
      has_block_between: {
        Args: { user1: string; user2: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_track_plays: {
        Args: { p_track_id: string }
        Returns: undefined
      }
      initialize_token_balance: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      ipf_age_coefficient: { Args: { p_age: number }; Returns: number }
      ipf_gl_score: {
        Args: { p_bodyweight_kg: number; p_sex?: string; p_total_kg: number }
        Returns: number
      }
      is_admin_or_owner: { Args: { _user_id: string }; Returns: boolean }
      is_blocked: {
        Args: { blocked: string; blocker: string }
        Returns: boolean
      }
      is_coach_of: {
        Args: { _athlete_id: string; _coach_id: string }
        Returns: boolean
      }
      is_conversation_participant: {
        Args: { conv_id: string; user_uuid: string }
        Returns: boolean
      }
      list_card_for_auction: {
        Args: {
          p_buy_now_price?: number
          p_card_id: string
          p_duration_hours?: number
          p_listing_type?: string
          p_starting_price?: number
        }
        Returns: Json
      }
      mark_stale_users_offline: { Args: never; Returns: undefined }
      notify_user: {
        Args: {
          p_body: string
          p_icon?: string
          p_title: string
          p_url?: string
          p_user_id: string
        }
        Returns: undefined
      }
      place_bid:
        | {
            Args: { _amount: number; _listing_id: string; _uid: string }
            Returns: Json
          }
        | { Args: { p_amount: number; p_listing_id: string }; Returns: Json }
      purchase_untunes: {
        Args: {
          _album_id?: string
          _gold_tier?: boolean
          _track_id?: string
          _type: string
        }
        Returns: Json
      }
      redeem_promo_code: {
        Args: { p_code: string; p_user_id: string }
        Returns: Json
      }
      refund_tokens: {
        Args: { p_amount: number; p_description?: string; p_user_id: string }
        Returns: number
      }
      relative_strength_rating: {
        Args: {
          p_age?: number
          p_bodyweight: number
          p_exercise: string
          p_sex: string
          p_weight_lifted: number
        }
        Returns: number
      }
      spend_tokens: {
        Args: {
          p_amount: number
          p_description?: string
          p_type?: string
          p_user_id: string
        }
        Returns: number
      }
      start_or_get_conversation: {
        Args: { recipient_id: string }
        Returns: string
      }
      transfer_tokens: {
        Args: { p_amount: number; p_recipient_id: string }
        Returns: Json
      }
      update_presence: { Args: { p_page?: string }; Returns: undefined }
    }
    Enums: {
      app_role: "dev" | "coach" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["dev", "coach", "user"],
    },
  },
} as const
