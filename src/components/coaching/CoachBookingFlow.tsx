import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar, Clock, PoundSterling, ShoppingCart, ChevronLeft, ChevronRight, Check, Loader2, Lock, Zap } from 'lucide-react';
import type { CoachPublicProfile } from '@/hooks/useCoachPublicProfile';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  coach: CoachPublicProfile;
  isUnlocked: boolean;
  onUnlock: () => void;
  availableSlots: { day_of_week: number; start_time: string; end_time: string; is_active: boolean }[];
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatTime(t: string) {
  const [h, m] = t.split(':');
  return `${h}:${m}`;
}

type Step = 'service' | 'schedule' | 'confirm';

export function CoachBookingFlow({ coach, isUnlocked, onUnlock, availableSlots }: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedBlock, setSelectedBlock] = useState<string>('single');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [booking, setBooking] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  // Build service options from coach profile
  const services = useMemo(() => {
    const s: { id: string; name: string; duration: string; price: number; blockPrices?: Record<string, number> }[] = [];
    if (coach.session_rate_30min) {
      s.push({
        id: '30min',
        name: '1-2-1 Session',
        duration: '30 min',
        price: coach.session_rate_30min,
        blockPrices: {
          single: coach.session_rate_30min,
          ...(coach.block_4_price ? { block4: Math.round(coach.block_4_price * 0.5) } : {}),
        },
      });
    }
    if (coach.session_rate_60min) {
      s.push({
        id: '60min',
        name: '1-2-1 Session',
        duration: '60 min',
        price: coach.session_rate_60min,
        blockPrices: {
          single: coach.session_rate_60min,
          ...(coach.block_4_price ? { block4: coach.block_4_price } : {}),
          ...(coach.block_8_price ? { block8: coach.block_8_price } : {}),
          ...(coach.block_12_price ? { block12: coach.block_12_price } : {}),
        },
      });
    }
    if (coach.online_monthly_rate) {
      s.push({
        id: 'hybrid',
        name: 'Hybrid Coaching',
        duration: 'Monthly',
        price: coach.online_monthly_rate,
      });
    }
    if (coach.free_consultation) {
      s.push({
        id: 'consultation',
        name: 'Free Consultation',
        duration: coach.consultation_length || '15 min',
        price: 0,
      });
    }
    return s;
  }, [coach]);

  const selectedServiceObj = services.find(s => s.id === selectedService);

  // Calculate price based on block selection
  const totalPrice = useMemo(() => {
    if (!selectedServiceObj) return 0;
    if (selectedServiceObj.blockPrices && selectedBlock !== 'single') {
      return selectedServiceObj.blockPrices[selectedBlock] || selectedServiceObj.price;
    }
    return selectedServiceObj.price;
  }, [selectedServiceObj, selectedBlock]);

  const blockLabel = selectedBlock === 'block4' ? '4 sessions' : selectedBlock === 'block8' ? '8 sessions' : selectedBlock === 'block12' ? '12 sessions' : '1 session';

  // Generate available dates for the next 4 weeks
  const weekDates = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7); // Monday start
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [weekOffset]);

  // Filter available time slots for selected date
  const timeSlotsForDate = useMemo(() => {
    if (!selectedDate) return [];
    const dayOfWeek = selectedDate.getDay();
    return availableSlots
      .filter(s => s.day_of_week === dayOfWeek && s.is_active)
      .map(s => s.start_time);
  }, [selectedDate, availableSlots]);

  const handleBook = async () => {
    if (!user || !selectedServiceObj) return;
    setBooking(true);
    try {
      // Create booking via RPC
      const { data, error } = await supabase.rpc('create_coaching_booking', {
        p_coach_id: coach.user_id,
        p_service_type: selectedService,
        p_block_type: selectedBlock,
        p_session_date: selectedDate?.toISOString().split('T')[0],
        p_session_time: selectedTime,
        p_price_gbp: totalPrice,
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      // If coach has Stripe Connect, redirect to checkout
      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }

      toast.success(`Booking confirmed! ${selectedServiceObj.name}, ${blockLabel}`);
      setStep('service');
      setSelectedService('');
      setSelectedDate(null);
      setSelectedTime('');
    } catch (err) {
      console.error('Booking error:', err);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  // If not unlocked, show token gate
  if (!isUnlocked) {
    return (
      <Card className="border-primary/20 bg-card">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-display text-lg tracking-wide mb-2">UNLOCK THIS COACH</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Spend tokens to unlock {coach.display_name || 'this coach'}'s booking calendar, services, and pricing.
          </p>
          <Button onClick={onUnlock} className="bg-primary hover:bg-primary/80 font-display tracking-wider gap-2">
            <Zap className="w-4 h-4" /> UNLOCK FOR 5 TOKENS
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Step indicators */}
      <div className="flex items-center gap-2 justify-center mb-4">
        {(['service', 'schedule', 'confirm'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-display tracking-wider transition-all ${
              step === s ? 'bg-primary text-white' : 
              (['service', 'schedule', 'confirm'].indexOf(step) > i) ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              {(['service', 'schedule', 'confirm'].indexOf(step) > i) ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            {i < 2 && <div className={`w-8 h-0.5 ${(['service', 'schedule', 'confirm'].indexOf(step) > i) ? 'bg-primary/40' : 'bg-muted'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Select Service */}
        {step === 'service' && (
          <motion.div key="service" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <h3 className="font-display text-sm tracking-wider text-primary mb-3">SELECT SERVICE</h3>
            <div className="space-y-2">
              {services.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedService(s.id)}
                  className={`w-full rounded-xl border p-4 text-left transition-all ${
                    selectedService === s.id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display text-sm tracking-wide">{s.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg text-primary">
                        {s.price === 0 ? 'FREE' : `£${s.price}`}
                      </p>
                      {s.id !== 'hybrid' && s.id !== 'consultation' && <p className="text-[10px] text-muted-foreground">per session</p>}
                      {s.id === 'hybrid' && <p className="text-[10px] text-muted-foreground">per month</p>}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Block booking options */}
            {selectedServiceObj && selectedServiceObj.blockPrices && Object.keys(selectedServiceObj.blockPrices).length > 1 && (
              <div className="mt-4">
                <h4 className="font-display text-xs tracking-wider text-muted-foreground mb-2">BLOCK BOOKING (SAVE MORE)</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(selectedServiceObj.blockPrices).map(([key, price]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedBlock(key)}
                      className={`rounded-lg border p-3 text-center transition-all ${
                        selectedBlock === key ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'
                      }`}
                    >
                      <p className="font-display text-xs tracking-wide">
                        {key === 'single' ? '1 Session' : key === 'block4' ? '4 Sessions' : key === 'block8' ? '8 Sessions' : '12 Sessions'}
                      </p>
                      <p className="text-primary font-display text-sm mt-1">£{price}</p>
                      {key !== 'single' && (
                        <p className="text-[9px] text-emerald-500 mt-0.5">
                          Save £{(selectedServiceObj.price * parseInt(key.replace('block', '')) - price)}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={() => setStep('schedule')}
              disabled={!selectedService}
              className="w-full mt-4 bg-primary hover:bg-primary/80 font-display tracking-wider"
            >
              NEXT: PICK A TIME
            </Button>
          </motion.div>
        )}

        {/* Step 2: Schedule */}
        {step === 'schedule' && (
          <motion.div key="schedule" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setStep('service')} className="text-muted-foreground text-xs flex items-center gap-1 hover:text-foreground">
                <ChevronLeft className="w-3 h-3" /> Back
              </button>
              <h3 className="font-display text-sm tracking-wider text-primary">PICK A DATE & TIME</h3>
              <div className="w-12" />
            </div>

            {/* Week navigation */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setWeekOffset(w => Math.max(0, w - 1))} disabled={weekOffset === 0} className="p-1 rounded-lg hover:bg-primary/10 disabled:opacity-30">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs text-muted-foreground font-display tracking-wide">
                {weekDates[0].toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })} — {weekDates[6].toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
              </span>
              <button onClick={() => setWeekOffset(w => Math.min(3, w + 1))} disabled={weekOffset >= 3} className="p-1 rounded-lg hover:bg-primary/10 disabled:opacity-30">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Day picker */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {weekDates.map((d, i) => {
                const dayOfWeek = d.getDay();
                const hasSlots = availableSlots.some(s => s.day_of_week === dayOfWeek && s.is_active);
                const isSelected = selectedDate && d.toDateString() === selectedDate.toDateString();
                const isPast = d < new Date(new Date().setHours(0, 0, 0, 0));
                return (
                  <button
                    key={i}
                    onClick={() => { setSelectedDate(d); setSelectedTime(''); }}
                    disabled={!hasSlots || isPast}
                    className={`p-2 rounded-lg text-center transition-all ${
                      isSelected ? 'bg-primary text-white' :
                      hasSlots && !isPast ? 'bg-card border border-border hover:border-primary/30' :
                      'bg-muted/30 text-muted-foreground/40'
                    }`}
                  >
                    <p className="text-[9px] font-display tracking-wider">{DAY_SHORT[dayOfWeek]}</p>
                    <p className="text-sm font-display">{d.getDate()}</p>
                  </button>
                );
              })}
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div>
                <h4 className="font-display text-xs tracking-wider text-muted-foreground mb-2">
                  AVAILABLE TIMES — {selectedDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
                </h4>
                {timeSlotsForDate.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlotsForDate.map(t => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`p-2 rounded-lg text-center font-display text-sm tracking-wide transition-all ${
                          selectedTime === t ? 'bg-primary text-white' : 'bg-card border border-border hover:border-primary/30'
                        }`}
                      >
                        {formatTime(t)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-4">No slots available this day</p>
                )}
              </div>
            )}

            <Button
              onClick={() => setStep('confirm')}
              disabled={!selectedDate || !selectedTime}
              className="w-full mt-4 bg-primary hover:bg-primary/80 font-display tracking-wider"
            >
              NEXT: CONFIRM BOOKING
            </Button>
          </motion.div>
        )}

        {/* Step 3: Confirm */}
        {step === 'confirm' && (
          <motion.div key="confirm" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setStep('schedule')} className="text-muted-foreground text-xs flex items-center gap-1 hover:text-foreground">
                <ChevronLeft className="w-3 h-3" /> Back
              </button>
              <h3 className="font-display text-sm tracking-wider text-primary">CONFIRM BOOKING</h3>
              <div className="w-12" />
            </div>

            <Card className="border-primary/20 bg-card">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Coach</span>
                  <span className="font-display text-sm">{coach.display_name || 'Coach'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Service</span>
                  <span className="font-display text-sm">{selectedServiceObj?.name} ({selectedServiceObj?.duration})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Package</span>
                  <span className="font-display text-sm">{blockLabel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Date</span>
                  <span className="font-display text-sm">{selectedDate?.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Time</span>
                  <span className="font-display text-sm">{formatTime(selectedTime)}</span>
                </div>
                <div className="border-t border-border pt-3 flex items-center justify-between">
                  <span className="font-display text-sm tracking-wide">TOTAL</span>
                  <span className="font-display text-xl text-primary">
                    {totalPrice === 0 ? 'FREE' : `£${totalPrice}`}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground text-center">
                  Payment goes directly to {coach.display_name || 'your coach'} via Stripe. Max 2 sessions per week. 24hr cancellation policy.
                </p>
              </CardContent>
            </Card>

            <Button
              onClick={handleBook}
              disabled={booking}
              className="w-full mt-4 bg-primary hover:bg-primary/80 font-display tracking-wider text-lg py-6"
              style={{ boxShadow: '0 0 20px rgba(255,85,0,0.3)' }}
            >
              {booking ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ShoppingCart className="w-5 h-5 mr-2" />}
              {totalPrice === 0 ? 'BOOK FREE CONSULTATION' : `PAY £${totalPrice}`}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
