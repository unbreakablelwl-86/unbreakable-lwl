import { createClient } from 'npm:@supabase/supabase-js@2.57.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Verify calling user is a dev
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user: callingUser }, error: authError } = await userClient.auth.getUser()
    if (authError || !callingUser) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check dev role
    const { data: isDev } = await userClient.rpc('has_role', { _user_id: callingUser.id, _role: 'dev' })
    if (!isDev) {
      return new Response(JSON.stringify({ error: 'Only Devs can delete users' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const { target_user_id } = body
    if (!target_user_id || typeof target_user_id !== 'string' || target_user_id.length > 100) {
      return new Response(JSON.stringify({ error: 'target_user_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Prevent self-deletion
    if (target_user_id === callingUser.id) {
      return new Response(JSON.stringify({ error: 'Cannot delete your own account' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    // Delete all user data from public tables
    const tables = [
      'exercise_logs', 'exercise_videos', 'workout_feedback', 'workout_sessions',
      'training_programs', 'programme_templates', 'progression_history',
      'food_logs', 'saved_foods', 'meal_plan_items', 'meal_plans', 'nutrition_goals',
      'runs', 'personal_records', 'medals', 'trophies', 'kudos', 'comments',
      'posts', 'post_comments', 'post_kudos', 'stories',
      'follows', 'friendships', 'blocked_users',
      'messages', 'conversation_participants',
      'notifications', 'milestones',
      'segment_efforts', 'local_legend_stats',
      'snake_scores', 'alleyway_scores', 'tetris_scores',
      'coaching_profiles', 'help_conversations', 'help_messages',
      'user_suspensions', 'user_roles', 'user_presence', 'user_settings',
      'admin_activity_logs',
      'profiles',
    ]

    for (const table of tables) {
      const col = table === 'friendships' ? 'requester_id' : 
                  table === 'follows' ? 'follower_id' :
                  table === 'blocked_users' ? 'blocker_id' :
                  table === 'comments' ? 'user_id' :
                  table === 'admin_activity_logs' ? 'admin_id' :
                  'user_id'
      
      await adminClient.from(table).delete().eq(col, target_user_id)
      
      // Also delete where user is the target (friendships, follows, blocks)
      if (table === 'friendships') {
        await adminClient.from(table).delete().eq('addressee_id', target_user_id)
      } else if (table === 'follows') {
        await adminClient.from(table).delete().eq('following_id', target_user_id)
      } else if (table === 'blocked_users') {
        await adminClient.from(table).delete().eq('blocked_id', target_user_id)
      }
    }

    // Delete user from auth
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(target_user_id)
    if (deleteError) {
      console.error('Error deleting auth user:', deleteError)
      return new Response(JSON.stringify({ error: 'Failed to delete auth user: ' + deleteError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Log the action
    await adminClient.from('admin_activity_logs').insert({
      admin_id: callingUser.id,
      action_type: 'delete_user',
      target_type: 'user',
      target_id: target_user_id,
      details: { permanent: true },
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
