 import { z } from 'zod';
 
 // Run validation schema matching database CHECK constraints
 export const runSchema = z.object({
   title: z.string().max(200, 'Title must be less than 200 characters').optional().nullable(),
   description: z.string().max(5000, 'Description must be less than 5000 characters').optional().nullable(),
   distance_km: z.number()
     .min(0.001, 'Distance must be at least 0.001 km')
     .max(999.999, 'Distance must be less than 1000 km'),
   duration_seconds: z.number()
     .int('Duration must be a whole number')
     .min(1, 'Duration must be at least 1 second')
     .max(86399, 'Duration must be less than 24 hours'),
   pace_per_km_seconds: z.number()
     .int()
     .min(60, 'Pace must be at least 1 minute per km')
     .max(1800, 'Pace must be less than 30 minutes per km')
     .optional()
     .nullable(),
   average_speed_kph: z.number()
     .min(0.5, 'Speed must be at least 0.5 km/h')
     .max(50, 'Speed must be less than 50 km/h')
     .optional()
     .nullable(),
   elevation_gain_m: z.number()
     .min(0, 'Elevation gain cannot be negative')
     .max(9999, 'Elevation gain must be less than 10000m')
     .optional()
     .nullable(),
   calories_burned: z.number()
     .int()
     .min(0, 'Calories cannot be negative')
     .max(49999, 'Calories must be less than 50000')
     .optional()
     .nullable(),
   notes: z.string().max(5000, 'Notes must be less than 5000 characters').optional().nullable(),
   weather_conditions: z.string().max(100, 'Weather conditions must be less than 100 characters').optional().nullable(),
   started_at: z.string(),
   ended_at: z.string().optional().nullable(),
   route_polyline: z.string().max(500000).optional().nullable(),
   map_snapshot_url: z.string().optional().nullable(),
   is_gps_tracked: z.boolean().optional(),
   temperature_celsius: z.number().optional().nullable(),
   is_public: z.boolean().optional(),
   visibility: z.enum(['public', 'friends', 'private']).optional(),
   comments_enabled: z.boolean().optional(),
 });
 
 // Profile validation schema matching database CHECK constraints
 export const profileSchema = z.object({
   username: z.string()
     .regex(/^[a-zA-Z0-9_]{3,30}$/, 'Username must be 3-30 characters and contain only letters, numbers, and underscores')
     .optional()
     .nullable(),
   display_name: z.string()
     .min(1, 'Display name is required')
     .max(100, 'Display name must be less than 100 characters')
     .optional()
     .nullable(),
   bio: z.string().max(500, 'Bio must be less than 500 characters').optional().nullable(),
   location: z.string().max(100, 'Location must be less than 100 characters').optional().nullable(),
   avatar_url: z.string().optional().nullable(),
   date_of_birth: z.string().optional().nullable(),
   is_public: z.boolean().optional(),
   // Social links
   social_instagram: z.string().max(100).optional().nullable(),
   social_tiktok: z.string().max(100).optional().nullable(),
   social_twitter: z.string().max(100).optional().nullable(),
   social_facebook: z.string().max(200).optional().nullable(),
   social_youtube: z.string().max(200).optional().nullable(),
   social_snapchat: z.string().max(100).optional().nullable(),
 });
 
 // Comment validation schema
 export const commentSchema = z.object({
   content: z.string()
     .min(1, 'Comment cannot be empty')
     .max(2000, 'Comment must be less than 2000 characters')
     .refine(
       (val) => val.trim().length > 0,
       { message: 'Comment cannot be empty or whitespace only' }
     ),
 });
 
 // Run update validation (subset of fields that can be updated)
 export const runUpdateSchema = z.object({
   title: z.string().max(200, 'Title must be less than 200 characters').optional(),
   description: z.string().max(5000, 'Description must be less than 5000 characters').optional(),
   visibility: z.enum(['public', 'friends', 'private']).optional(),
 });
 
 // Helper function to get first validation error message
export function getValidationError<T>(result: z.SafeParseReturnType<T, T>): string {
  if (result.success) return '';
   return result.error.errors[0]?.message || 'Validation failed';
 }