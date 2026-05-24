import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSnapTrack, SnapItem, SnapResult } from '@/hooks/useSnapTrack';
import { useFoodLogs } from '@/hooks/useFoodLogs';
import { useSavedFoods } from '@/hooks/useSavedFoods';
import { MealType, mealTypeLabels } from '@/lib/fuelTypes';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  SwitchCamera,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  ImagePlus,
  Flame,
  Zap,
  Plus,
  RotateCcw,
  Coffee,
  UtensilsCrossed,
  Moon,
  Cookie,
} from 'lucide-react';
import { toast } from 'sonner';

interface SnapTrackProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMealType?: MealType;
}

type ViewState = 'camera' | 'preview' | 'scanning' | 'results';

const mealIcons: Record<MealType, React.ReactNode> = {
  breakfast: <Coffee className="w-4 h-4" />,
  lunch: <UtensilsCrossed className="w-4 h-4" />,
  dinner: <Moon className="w-4 h-4" />,
  snack: <Cookie className="w-4 h-4" />,
};

const confidenceColors: Record<string, string> = {
  high: 'bg-primary/20 text-primary border-primary/30',
  medium: 'bg-primary/20 text-primary border-primary/30',
  low: 'bg-primary/20 text-primary border-primary/30',
};

export function SnapTrack({ isOpen, onClose, defaultMealType = 'lunch' }: SnapTrackProps) {
  const { scanImage, isScanning, result, error, reset } = useSnapTrack();
  const { addFoodLog } = useFoodLogs();
  const { saveFood } = useSavedFoods();
  const { balance, refresh: refreshTokens } = useTokenBalance();

  const [viewState, setViewState] = useState<ViewState>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<MealType>(defaultMealType);
  const [loggedItems, setLoggedItems] = useState<Set<number>>(new Set());
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Camera access denied — use the upload button instead');
      setCameraActive(false);
    }
  }, [facingMode]);

  // Stop camera
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  // Handle open/close
  useEffect(() => {
    if (isOpen && viewState === 'camera') {
      startCamera();
    }
    if (!isOpen) {
      stopCamera();
      handleReset();
    }
    return () => stopCamera();
  }, [isOpen]);

  // Toggle camera facing
  const toggleCamera = useCallback(() => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  }, []);

  useEffect(() => {
    if (cameraActive && viewState === 'camera') {
      startCamera();
    }
  }, [facingMode]);

  // Capture photo from camera
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    setViewState('preview');
    stopCamera();
  }, [stopCamera]);

  // Handle file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image too large — max 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setCapturedImage(dataUrl);
      setViewState('preview');
      stopCamera();
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be selected again
    e.target.value = '';
  }, [stopCamera]);

  // Scan the captured image
  const handleScan = useCallback(async () => {
    if (!capturedImage) return;
    setViewState('scanning');
    const res = await scanImage(capturedImage);
    if (res) {
      setViewState('results');
      refreshTokens();
    } else {
      setViewState('preview');
    }
  }, [capturedImage, scanImage, refreshTokens]);

  // Log a single food item
  const handleLogItem = useCallback(
    async (item: SnapItem, index: number) => {
      try {
        await addFoodLog.mutateAsync({
          food_name: item.name,
          calories: item.calories,
          protein_g: item.protein,
          carbs_g: item.carbs,
          fat_g: item.fat,
          meal_type: selectedMeal,
          servings: 1,
          serving_size: item.portion,
          logged_at: new Date().toISOString(),
        });

        // Also save to cupboard
        saveFood.mutate({
          food_name: item.name,
          calories: item.calories,
          protein_g: item.protein,
          carbs_g: item.carbs,
          fat_g: item.fat,
          serving_size: item.portion,
          is_favourite: false,
        });

        setLoggedItems((prev) => new Set(prev).add(index));
        toast.success(`${item.name} logged to ${mealTypeLabels[selectedMeal]}`);
      } catch {
        toast.error('Failed to log — try again');
      }
    },
    [addFoodLog, saveFood, selectedMeal]
  );

  // Log all items at once
  const handleLogAll = useCallback(async () => {
    if (!result) return;
    const unlogged = result.items.filter((_, i) => !loggedItems.has(i));
    for (let i = 0; i < result.items.length; i++) {
      if (!loggedItems.has(i)) {
        await handleLogItem(result.items[i], i);
      }
    }
  }, [result, loggedItems, handleLogItem]);

  // Reset everything
  const handleReset = useCallback(() => {
    reset();
    setCapturedImage(null);
    setViewState('camera');
    setLoggedItems(new Set());
    setCameraError(null);
  }, [reset]);

  // Retake photo
  const handleRetake = useCallback(() => {
    setCapturedImage(null);
    setViewState('camera');
    startCamera();
  }, [startCamera]);

  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  const allLogged = result ? result.items.every((_, i) => loggedItems.has(i)) : false;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg p-0 gap-0 bg-background border-primary/30 overflow-hidden max-h-[90vh] bg-background border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Camera className="w-4 h-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="font-display text-base tracking-wide">
                SNAP & TRACK
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                {viewState === 'camera' && 'Snap your meal for instant macros'}
                {viewState === 'preview' && 'Ready to scan'}
                {viewState === 'scanning' && 'Analysing your meal...'}
                {viewState === 'results' && 'Results ready'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono border-primary/30">
              <Zap className="w-3 h-3 mr-1 text-primary" />
              0.5 tokens
            </Badge>
          </div>
        </div>

        <ScrollArea className="max-h-[calc(90vh-56px)]">
          <div className="p-4 space-y-4">
            {/* Camera / Preview / Scanning Views */}
            <AnimatePresence mode="wait">
              {/* CAMERA VIEW */}
              {viewState === 'camera' && (
                <motion.div
                  key="camera"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  <div className="relative aspect-[4/3] bg-background rounded-xl overflow-hidden border-2 border-primary/20">
                    {cameraError ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <AlertCircle className="w-12 h-12 text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground mb-4">{cameraError}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="border-primary/30"
                        >
                          <ImagePlus className="w-4 h-4 mr-2" />
                          Upload Photo
                        </Button>
                      </div>
                    ) : (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* Scan overlay */}
                    {cameraActive && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-primary/60 rounded-tl-lg" />
                        <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-primary/60 rounded-tr-lg" />
                        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-primary/60 rounded-bl-lg" />
                        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-primary/60 rounded-br-lg" />
                      </div>
                    )}
                  </div>

                  {/* Camera controls */}
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-full border-border"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImagePlus className="w-5 h-5" />
                    </Button>

                    <Button
                      size="icon"
                      className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                      onClick={capturePhoto}
                      disabled={!cameraActive}
                    >
                      <Camera className="w-7 h-7 text-primary-foreground" />
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-full border-border"
                      onClick={toggleCamera}
                      disabled={!cameraActive}
                    >
                      <SwitchCamera className="w-5 h-5" />
                    </Button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </motion.div>
              )}

              {/* PREVIEW VIEW */}
              {viewState === 'preview' && capturedImage && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-primary/30">
                    <img
                      src={capturedImage}
                      alt="Captured meal"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Meal type selector */}
                  <div className="flex gap-2 justify-center flex-wrap">
                    {(Object.keys(mealTypeLabels) as MealType[]).map((type) => (
                      <Button
                        key={type}
                        variant={selectedMeal === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedMeal(type)}
                        className={`text-xs ${
                          selectedMeal === type
                            ? 'bg-primary text-primary-foreground'
                            : 'border-border hover:border-primary/40'
                        }`}
                      >
                        {mealIcons[type]}
                        <span className="ml-1.5">{mealTypeLabels[type]}</span>
                      </Button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-border"
                      onClick={handleRetake}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Retake
                    </Button>
                    <Button
                      className="flex-1 bg-primary hover:bg-primary/90 font-display tracking-wide"
                      onClick={handleScan}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      SCAN MEAL
                    </Button>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* SCANNING VIEW */}
              {viewState === 'scanning' && (
                <motion.div
                  key="scanning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {capturedImage && (
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-primary/30">
                      <img
                        src={capturedImage}
                        alt="Scanning meal"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-background/50 flex flex-col items-center justify-center">
                        <div className="relative">
                          <Loader2 className="w-16 h-16 text-primary animate-spin" />
                          <Flame className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <p className="font-display text-lg tracking-wide text-primary mt-4">
                          SCANNING...
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Identifying food &amp; estimating macros
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* RESULTS VIEW */}
              {viewState === 'results' && result && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Meal image (small) */}
                  {capturedImage && (
                    <div className="relative h-32 rounded-xl overflow-hidden border border-primary/20">
                      <img
                        src={capturedImage}
                        alt="Scanned meal"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3">
                        <p className="font-display text-sm tracking-wide text-foreground">
                          {result.meal_summary}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Total macros summary */}
                  <Card className="border-primary/30 bg-primary/5 border-border bg-card">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-4 gap-3 text-center">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">Calories</p>
                          <p className="font-display text-xl text-primary">
                            {result.total_calories}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">Protein</p>
                          <p className="font-display text-xl text-foreground">
                            {result.total_protein}g
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">Carbs</p>
                          <p className="font-display text-xl text-foreground">
                            {result.total_carbs}g
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">Fat</p>
                          <p className="font-display text-xl text-foreground">
                            {result.total_fat}g
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Individual items */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                      Identified Items ({result.items.length})
                    </p>
                    {result.items.map((item, index) => (
                      <Card
                        key={index}
                        className={`border transition-all ${
                          loggedItems.has(index)
                            ? 'border-primary/30 bg-primary/5'
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-sm truncate">{item.name}</p>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] shrink-0 ${
                                    confidenceColors[item.confidence] || ''
                                  }`}
                                >
                                  {item.confidence}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">{item.portion}</p>
                              <div className="flex gap-3 text-xs">
                                <span className="text-primary font-semibold">
                                  {item.calories} kcal
                                </span>
                                <span>P {item.protein}g</span>
                                <span>C {item.carbs}g</span>
                                <span>F {item.fat}g</span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant={loggedItems.has(index) ? 'ghost' : 'outline'}
                              className={`shrink-0 ${
                                loggedItems.has(index)
                                  ? 'text-primary cursor-default'
                                  : 'border-primary/30 hover:bg-primary/10'
                              }`}
                              onClick={() => !loggedItems.has(index) && handleLogItem(item, index)}
                              disabled={loggedItems.has(index)}
                            >
                              {loggedItems.has(index) ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Logged
                                </>
                              ) : (
                                <>
                                  <Plus className="w-4 h-4 mr-1" />
                                  Log
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Coach note */}
                  {result.coach_note && (
                    <div className="flex gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <Flame className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground">{result.coach_note}</p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-border"
                      onClick={() => {
                        handleReset();
                        setViewState('camera');
                        startCamera();
                      }}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Scan Another
                    </Button>
                    {!allLogged && result.items.length > 0 && (
                      <Button
                        className="flex-1 bg-primary hover:bg-primary/90 font-display tracking-wide"
                        onClick={handleLogAll}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        LOG ALL
                      </Button>
                    )}
                    {allLogged && (
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 font-display tracking-wide"
                        onClick={handleClose}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        DONE
                      </Button>
                    )}
                  </div>

                  {/* Token info */}
                  {result.tokens_remaining !== undefined && (
                    <p className="text-center text-xs text-muted-foreground">
                      <Zap className="w-3 h-3 inline mr-1 text-primary" />
                      {result.tokens_remaining.toFixed(1)} tokens remaining
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
