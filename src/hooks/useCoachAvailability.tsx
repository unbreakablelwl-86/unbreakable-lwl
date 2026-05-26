import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface AvailabilitySlot {
  id: string;
  user_id: string;
  day_of_week: number; // 0=Sun, 6=Sat
  start_time: string; // HH:MM:SS
  end_time: string;
  session_length: '30min' | '60min';
  is_active: boolean;
}

export interface BlockedDate {
  id: string;
  user_id: string;
  blocked_date: string; // YYYY-MM-DD
  reason: string | null;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export { DAY_NAMES, DAY_NAMES_SHORT };

export function useCoachAvailability(userId?: string) {
  const { user } = useAuth();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || user?.id;

  const fetchSlots = useCallback(async () => {
    if (!targetUserId) { setLoading(false); return; }

    const [slotsRes, blockedRes] = await Promise.all([
      supabase
        .from('coach_availability_slots')
        .select('*')
        .eq('user_id', targetUserId)
        .order('day_of_week')
        .order('start_time'),
      supabase
        .from('coach_blocked_dates')
        .select('*')
        .eq('user_id', targetUserId)
        .order('blocked_date'),
    ]);

    if (slotsRes.data) setSlots(slotsRes.data as AvailabilitySlot[]);
    if (blockedRes.data) setBlockedDates(blockedRes.data as BlockedDate[]);
    setLoading(false);
  }, [targetUserId]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const addSlot = async (slot: Omit<AvailabilitySlot, 'id' | 'user_id' | 'is_active'>) => {
    if (!user) return;
    const { error } = await supabase
      .from('coach_availability_slots')
      .insert({ ...slot, user_id: user.id, is_active: true });
    if (error) {
      if (error.code === '23505') toast.error('Slot already exists for that day/time');
      else toast.error('Failed to add slot');
      return;
    }
    toast.success('Slot added');
    fetchSlots();
  };

  const removeSlot = async (slotId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('coach_availability_slots')
      .delete()
      .eq('id', slotId)
      .eq('user_id', user.id);
    if (error) { toast.error('Failed to remove slot'); return; }
    toast.success('Slot removed');
    fetchSlots();
  };

  const toggleSlot = async (slotId: string, isActive: boolean) => {
    if (!user) return;
    const { error } = await supabase
      .from('coach_availability_slots')
      .update({ is_active: isActive })
      .eq('id', slotId)
      .eq('user_id', user.id);
    if (error) { toast.error('Failed to update slot'); return; }
    fetchSlots();
  };

  const addBlockedDate = async (date: string, reason?: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('coach_blocked_dates')
      .insert({ user_id: user.id, blocked_date: date, reason: reason || null });
    if (error) {
      if (error.code === '23505') toast.error('Date already blocked');
      else toast.error('Failed to block date');
      return;
    }
    toast.success('Date blocked');
    fetchSlots();
  };

  const removeBlockedDate = async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('coach_blocked_dates')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) { toast.error('Failed to unblock date'); return; }
    toast.success('Date unblocked');
    fetchSlots();
  };

  return {
    slots,
    blockedDates,
    loading,
    addSlot,
    removeSlot,
    toggleSlot,
    addBlockedDate,
    removeBlockedDate,
    refetch: fetchSlots,
  };
}
