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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
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
          city: string | null
          bench_max_kg: number | null
          biggest_challenge: string | null
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
          nutrition_goal: string | null
          onboarding_completed: boolean
          preferred_cardio: string | null
          preferred_height_unit: string
          preferred_weight_unit: string
          primary_motivation: string | null
          race_goals: string | null
          session_length_minutes: number | null
          sleep_hours: number | null
          sleep_quality: string | null
          squat_max_kg: number | null
          stress_level: string | null
          training_goal: string | null
          updated_at: string
          user_id: string
          weekly_cardio_frequency: number | null
          weight_kg: number | null
        }
        Insert: {
          age_years?: number | null
          allergies?: string | null
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
          nutrition_goal?: string | null
          onboarding_completed?: boolean
          preferred_cardio?: string | null
          preferred_height_unit?: string
          preferred_weight_unit?: string
          primary_motivation?: string | null
          race_goals?: string | null
          session_length_minutes?: number | null
          sleep_hours?: number | null
          sleep_quality?: string | null
          squat_max_kg?: number | null
          stress_level?: string | null
          training_goal?: string | null
          updated_at?: string
          user_id: string
          weekly_cardio_frequency?: number | null
          weight_kg?: number | null
        }
        Update: {
          age_years?: number | null
          allergies?: string | null
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
          nutrition_goal?: string | null
          onboarding_completed?: boolean
          preferred_cardio?: string | null
          preferred_height_unit?: string
          preferred_weight_unit?: string
          primary_motivation?: string | null
          race_goals?: string | null
          session_length_minutes?: number | null
          sleep_hours?: number | null
          sleep_quality?: string | null
          squat_max_kg?: number | null
          stress_level?: string | null
          training_goal?: string | null
          updated_at?: string
          user_id?: string
          weekly_cardio_frequency?: number | null
          weight_kg?: number | null
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
      daily_habits: {
        Row: {
          created_at: string
          do_the_hard_thing: boolean
          habit_date: string
          hit_your_numbers: boolean
          id: string
          journal: string
          learn_daily: boolean
          train: boolean
          updated_at: string
          user_id: string
          water: boolean
        }
        Insert: {
          created_at?: string
          do_the_hard_thing?: boolean
          habit_date?: string
          hit_your_numbers?: boolean
          id?: string
          journal?: string
          learn_daily?: boolean
          train?: boolean
          updated_at?: string
          user_id: string
          water?: boolean
        }
        Update: {
          created_at?: string
          do_the_hard_thing?: boolean
          habit_date?: string
          hit_your_numbers?: boolean
          id?: string
          journal?: string
          learn_daily?: boolean
          train?: boolean
          updated_at?: string
          user_id?: string
          water?: boolean
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
      mindset_programmes: {
        Row: {
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
          id: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          read?: boolean
          title?: string
          type?: string
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
          updated_at?: string
          user_id?: string
          video_url?: string | null
          visibility?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          date_of_birth: string | null
          display_name: string | null
          id: string
          is_public: boolean
          location: string | null
          social_facebook: string | null
          social_instagram: string | null
          social_tiktok: string | null
          social_twitter: string | null
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
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          id?: string
          is_public?: boolean
          location?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_tiktok?: string | null
          social_twitter?: string | null
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
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          id?: string
          is_public?: boolean
          location?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_tiktok?: string | null
          social_twitter?: string | null
          total_distance_km?: number | null
          total_runs?: number | null
          total_time_seconds?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
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
        Relationships: []
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
      training_programs: {
        Row: {
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
      [_ in never]: never
    }
    Functions: {
      are_friends: { Args: { user1: string; user2: string }; Returns: boolean }
      can_message_user: {
        Args: { recipient_id: string; sender_id: string }
        Returns: boolean
      }
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
      start_or_get_conversation: {
        Args: { recipient_id: string }
        Returns: string
      }
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
