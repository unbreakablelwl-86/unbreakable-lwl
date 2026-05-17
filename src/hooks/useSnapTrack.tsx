import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SnapItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface SnapResult {
  items: SnapItem[];
  meal_summary: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  coach_note: string;
  tokens_remaining?: number;
  timestamp?: string;
}

export function useSnapTrack() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<SnapResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scanImage = useCallback(async (base64Image: string) => {
    setIsScanning(true);
    setError(null);
    setResult(null);

    try {
      abortRef.current = new AbortController();

      const { data, error: fnError } = await supabase.functions.invoke('snap-track', {
        body: { image: base64Image },
      });

      if (fnError) {
        const message = fnError.message || 'Scan failed';
        // Check for token-related errors
        if (message.includes('insufficient_tokens') || message.includes('402')) {
          setError('Not enough tokens — upgrade your plan for more scans');
          toast.error('Not enough Unbreakable Tokens for a scan');
        } else {
          setError(message);
          toast.error(message);
        }
        return null;
      }

      if (data?.error) {
        if (data.code === 'insufficient_tokens') {
          setError('Not enough tokens — upgrade your plan for more scans');
          toast.error('Not enough Unbreakable Tokens');
        } else {
          setError(data.error);
          toast.error(data.error);
        }
        return null;
      }

      setResult(data as SnapResult);
      return data as SnapResult;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Scan failed — try again';
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setIsScanning(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsScanning(false);
    abortRef.current?.abort();
  }, []);

  return {
    scanImage,
    isScanning,
    result,
    error,
    reset,
  };
}
