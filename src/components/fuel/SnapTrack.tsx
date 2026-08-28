import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSnapTrack, SnapItem, SnapResult } from '@/hooks/useSnapTrack';
import { useFoodLogs } from '@/hooks/useFoodLogs';
import { useSavedFoods } from '@/hooks/useSavedFoods';
import { MealType, mealTypeLabels } from '@/lib/fuelTypes';
import { useTokenBalance } from '@/hooks/useTokenBalance';
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
  Pencil,
  Trash2,
  Info,
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

  // Editable copy of the scan results — lets the user correct/add missed ingredients
  const [editableItems, setEditableItems] = useState<SnapItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showCameraPrompt, setShowCameraPrompt] = useState(false);

  // Start camera with permission check
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      // Check permission status first
      let permStatus: PermissionState | null = null;
      try {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        permStatus = result.state;
      } catch {
        // permissions API not supported — just try getUserMedia
      }

      if (permStatus === 'denied') {
        setCameraError('denied');
        setCameraActive(false);
        return;
      }

      if (permStatus === 'prompt') {
        // Show our own popup before triggering the browser prompt
        setShowCameraPrompt(true);
        return;
      }

      // Permission granted or unknown — proceed
      await requestCameraAccess();
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('denied');
      setCameraActive(false);
    }
  }, [facingMode]);

  // Actually request camera access
  const requestCameraAccess = useCallback(async () => {
    try {
      setCameraError(null);
      setShowCameraPrompt(false);

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
      setCameraError('denied');
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
      setEditableItems(res.items);
      setEditingIndex(null);
      setViewState('results');
      refreshTokens();
    } else {
      setViewState('preview');
    }
  }, [capturedImage, scanImage, refreshTokens]);

  // Editable results helpers — supports correcting the AI's guess or adding missed ingredients
  const blankItem = (): SnapItem => ({
    name: '',
    portion: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    confidence: 'low',
  });

  const updateEditableItem = useCallback(
    (index: number, patch: Partial<SnapItem>) => {
      setEditableItems((prev) =>
        prev.map((it, i) => (i === index ? { ...it, ...patch } : it))
      );
    },
    []
  );

  const handleAddMissingItem = useCallback(() => {
    setEditableItems((prev) => {
      const next = [...prev, blankItem()];
      setEditingIndex(next.length - 1);
      return next;
    });
  }, []);

  const handleRemoveItem = useCallback((index: number) => {
    setEditableItems((prev) => prev.filter((_, i) => i !== index));
    setLoggedItems((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => {
        if (i < index) next.add(i);
        else if (i > index) next.add(i - 1);
      });
      return next;
    });
    setEditingIndex((cur) => (cur === index ? null : cur));
  }, []);

  const editableTotals = editableItems.reduce(
    (acc, it) => ({
      calories: acc.calories + (Number(it.calories) || 0),
      protein: acc.protein + (Number(it.protein) || 0),
      carbs: acc.carbs + (Number(it.carbs) || 0),
      fat: acc.fat + (Number(it.fat) || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

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
    for (let i = 0; i < editableItems.length; i++) {
      if (!loggedItems.has(i)) {
        await handleLogItem(editableItems[i], i);
      }
    }
  }, [editableItems, loggedItems, handleLogItem]);

  // Reset everything
  const handleReset = useCallback(() => {
    reset();
    setCapturedImage(null);
    setViewState('camera');
    setLoggedItems(new Set());
    setCameraError(null);
    setEditableItems([]);
    setEditingIndex(null);
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

  const allLogged =
    editableItems.length > 0 && editableItems.every((_, i) => loggedItems.has(i));

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
            <>
              {/* CAMERA VIEW */}
              {viewState === 'camera' && (
                <div
                  key="camera"
                  className="space-y-3"
                >
                  <div className="relative aspect-[4/3] bg-background rounded-xl overflow-hidden border-2 border-primary/20">
                    {showCameraPrompt ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-background/95 z-10">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                          <Camera className="w-8 h-8 text-primary" />
                        </div>
                        <p className="font-display text-sm tracking-wider text-foreground mb-2">CAMERA ACCESS NEEDED</p>
                        <p className="text-xs text-muted-foreground mb-4 max-w-[250px]">
                          Snap & Track uses your camera to scan meals and estimate macros instantly.
                        </p>
                        <Button
                          size="sm"
                          className="bg-primary text-primary-foreground font-display tracking-wider text-xs mb-2"
                          onClick={requestCameraAccess}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          ALLOW CAMERA
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-muted-foreground"
                          onClick={() => { setShowCameraPrompt(false); fileInputRef.current?.click(); }}
                        >
                          <ImagePlus className="w-4 h-4 mr-1" />
                          Upload photo instead
                        </Button>
                      </div>
                    ) : cameraError ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <AlertCircle className="w-12 h-12 text-primary/60 mb-3" />
                        <p className="font-display text-sm tracking-wider text-foreground mb-2">CAMERA BLOCKED</p>
                        <p className="text-xs text-muted-foreground mb-1 max-w-[250px]">
                          Camera access was denied. To enable it:
                        </p>
                        <div className="text-[10px] text-muted-foreground/80 mb-4 max-w-[250px] text-left space-y-1">
                          <p>📱 <strong>iPhone/iPad:</strong> Settings → Safari → Camera → Allow</p>
                          <p>🤖 <strong>Android:</strong> Tap the 🔒 icon in your browser address bar → Permissions → Camera → Allow</p>
                          <p>💻 <strong>Desktop:</strong> Click the camera icon in the address bar → Allow</p>
                        </div>
                        <Button
                          size="sm"
                          className="bg-primary text-primary-foreground font-display tracking-wider text-xs mb-2"
                          onClick={() => { setCameraError(null); startCamera(); }}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          TRY AGAIN
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="border-primary/30 text-xs"
                        >
                          <ImagePlus className="w-4 h-4 mr-2" />
                          Upload Photo Instead
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
                </div>
              )}

              {/* PREVIEW VIEW */}
              {viewState === 'preview' && capturedImage && (
                <div
                  key="preview"
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
                </div>
              )}

              {/* SCANNING VIEW */}
              {viewState === 'scanning' && (
                <div
                  key="scanning"
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
                </div>
              )}

              {/* RESULTS VIEW */}
              {viewState === 'results' && result && (
                <div
                  key="results"
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
                            {editableTotals.calories}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">Protein</p>
                          <p className="font-display text-xl text-foreground">
                            {editableTotals.protein}g
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">Carbs</p>
                          <p className="font-display text-xl text-foreground">
                            {editableTotals.carbs}g
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">Fat</p>
                          <p className="font-display text-xl text-foreground">
                            {editableTotals.fat}g
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Reference-only disclaimer */}
                  <div className="flex items-start gap-2 px-1">
                    <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Scans are for reference only — details may vary. Missing or wrong ingredient?
                      Tap the pencil to edit, or add anything the scanner missed below.
                    </p>
                  </div>

                  {/* Individual items */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                      Identified Items ({editableItems.length})
                    </p>
                    {editableItems.map((item, index) => {
                      const isEditing = editingIndex === index;
                      return (
                        <Card
                          key={index}
                          className={`border transition-all ${
                            loggedItems.has(index)
                              ? 'border-primary/30 bg-primary/5'
                              : isEditing
                              ? 'border-primary/40'
                              : 'border-border hover:border-primary/30'
                          }`}
                        >
                          <CardContent className="p-3">
                            {isEditing ? (
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <Input
                                    value={item.name}
                                    onChange={(e) => updateEditableItem(index, { name: e.target.value })}
                                    placeholder="Food name"
                                    className="h-8 text-sm flex-1"
                                  />
                                  <Input
                                    value={item.portion}
                                    onChange={(e) => updateEditableItem(index, { portion: e.target.value })}
                                    placeholder="Portion"
                                    className="h-8 text-sm flex-1"
                                  />
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                  <Input
                                    type="number"
                                    value={item.calories}
                                    onChange={(e) => updateEditableItem(index, { calories: Number(e.target.value) })}
                                    placeholder="kcal"
                                    className="h-8 text-xs"
                                  />
                                  <Input
                                    type="number"
                                    value={item.protein}
                                    onChange={(e) => updateEditableItem(index, { protein: Number(e.target.value) })}
                                    placeholder="P (g)"
                                    className="h-8 text-xs"
                                  />
                                  <Input
                                    type="number"
                                    value={item.carbs}
                                    onChange={(e) => updateEditableItem(index, { carbs: Number(e.target.value) })}
                                    placeholder="C (g)"
                                    className="h-8 text-xs"
                                  />
                                  <Input
                                    type="number"
                                    value={item.fat}
                                    onChange={(e) => updateEditableItem(index, { fat: Number(e.target.value) })}
                                    placeholder="F (g)"
                                    className="h-8 text-xs"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                                    onClick={() => handleRemoveItem(index)}
                                  >
                                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                                    Remove
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="flex-1 bg-primary hover:bg-primary/90"
                                    onClick={() => setEditingIndex(null)}
                                  >
                                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                    Done
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-semibold text-sm truncate">{item.name || 'Untitled item'}</p>
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
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    onClick={() => setEditingIndex(index)}
                                    aria-label="Edit item"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={loggedItems.has(index) ? 'ghost' : 'outline'}
                                    className={
                                      loggedItems.has(index)
                                        ? 'text-primary cursor-default'
                                        : 'border-primary/30 hover:bg-primary/10'
                                    }
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
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-dashed border-primary/30 text-primary hover:bg-primary/10"
                      onClick={handleAddMissingItem}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add missed ingredient
                    </Button>
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
                    {!allLogged && editableItems.length > 0 && (
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
                </div>
              )}
            </>
          </div>
        </ScrollArea>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Pencil,
  Trash2,
  Info,
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

  // Editable copy of the scan results — lets the user correct/add missed ingredients
  const [editableItems, setEditableItems] = useState<SnapItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showCameraPrompt, setShowCameraPrompt] = useState(false);

  // Start camera with permission check
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      // Check permission status first
      let permStatus: PermissionState | null = null;
      try {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        permStatus = result.state;
      } catch {
        // permissions API not supported — just try getUserMedia
      }

      if (permStatus === 'denied') {
        setCameraError('denied');
        setCameraActive(false);
        return;
      }

      if (permStatus === 'prompt') {
        // Show our own popup before triggering the browser prompt
        setShowCameraPrompt(true);
        return;
      }

      // Permission granted or unknown — proceed
      await requestCameraAccess();
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('denied');
      setCameraActive(false);
    }
  }, [facingMode]);

  // Actually request camera access
  const requestCameraAccess = useCallback(async () => {
    try {
      setCameraError(null);
      setShowCameraPrompt(false);

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
      setCameraError('denied');
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
      setEditableItems(res.items);
      setEditingIndex(null);
      setViewState('results');
      refreshTokens();
    } else {
      setViewState('preview');
    }
  }, [capturedImage, scanImage, refreshTokens]);

  // Editable results helpers — supports correcting the AI's guess or adding missed ingredients
  const blankItem = (): SnapItem => ({
    name: '',
    portion: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    confidence: 'low',
  });

  const updateEditableItem = useCallback(
    (index: number, patch: Partial<SnapItem>) => {
      setEditableItems((prev) =>
        prev.map((it, i) => (i === index ? { ...it, ...patch } : it))
      );
    },
    []
  );

  const handleAddMissingItem = useCallback(() => {
    setEditableItems((prev) => {
      const next = [...prev, blankItem()];
      setEditingIndex(next.length - 1);
      return next;
    });
  }, []);

  const handleRemoveItem = useCallback((index: number) => {
    setEditableItems((prev) => prev.filter((_, i) => i !== index));
    setLoggedItems((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => {
        if (i < index) next.add(i);
        else if (i > index) next.add(i - 1);
      });
      return next;
    });
    setEditingIndex((cur) => (cur === index ? null : cur));
  }, []);

  const editableTotals = editableItems.reduce(
    (acc, it) => ({
      calories: acc.calories + (Number(it.calories) || 0),
      protein: acc.protein + (Number(it.protein) || 0),
      carbs: acc.carbs + (Number(it.carbs) || 0),
      fat: acc.fat + (Number(it.fat) || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

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
    for (let i = 0; i < editableItems.length; i++) {
      if (!loggedItems.has(i)) {
        await handleLogItem(editableItems[i], i);
      }
    }
  }, [editableItems, loggedItems, handleLogItem]);

  // Reset everything
  const handleReset = useCallback(() => {
    reset();
    setCapturedImage(null);
    setViewState('camera');
    setLoggedItems(new Set());
    setCameraError(null);
    setEditableItems([]);
    setEditingIndex(null);
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

  const allLogged =
    editableItems.length > 0 && editableItems.every((_, i) => loggedItems.has(i));

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
            <AnimatePresence>
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
                    {showCameraPrompt ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-background/95 z-10">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                          <Camera className="w-8 h-8 text-primary" />
                        </div>
                        <p className="font-display text-sm tracking-wider text-foreground mb-2">CAMERA ACCESS NEEDED</p>
                        <p className="text-xs text-muted-foreground mb-4 max-w-[250px]">
                          Snap & Track uses your camera to scan meals and estimate macros instantly.
                        </p>
                        <Button
                          size="sm"
                          className="bg-primary text-primary-foreground font-display tracking-wider text-xs mb-2"
                          onClick={requestCameraAccess}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          ALLOW CAMERA
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-muted-foreground"
                          onClick={() => { setShowCameraPrompt(false); fileInputRef.current?.click(); }}
                        >
                          <ImagePlus className="w-4 h-4 mr-1" />
                          Upload photo instead
                        </Button>
                      </div>
                    ) : cameraError ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <AlertCircle className="w-12 h-12 text-primary/60 mb-3" />
                        <p className="font-display text-sm tracking-wider text-foreground mb-2">CAMERA BLOCKED</p>
                        <p className="text-xs text-muted-foreground mb-1 max-w-[250px]">
                          Camera access was denied. To enable it:
                        </p>
                        <div className="text-[10px] text-muted-foreground/80 mb-4 max-w-[250px] text-left space-y-1">
                          <p>📱 <strong>iPhone/iPad:</strong> Settings → Safari → Camera → Allow</p>
                          <p>🤖 <strong>Android:</strong> Tap the 🔒 icon in your browser address bar → Permissions → Camera → Allow</p>
                          <p>💻 <strong>Desktop:</strong> Click the camera icon in the address bar → Allow</p>
                        </div>
                        <Button
                          size="sm"
                          className="bg-primary text-primary-foreground font-display tracking-wider text-xs mb-2"
                          onClick={() => { setCameraError(null); startCamera(); }}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          TRY AGAIN
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="border-primary/30 text-xs"
                        >
                          <ImagePlus className="w-4 h-4 mr-2" />
                          Upload Photo Instead
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
                            {editableTotals.calories}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">Protein</p>
                          <p className="font-display text-xl text-foreground">
                            {editableTotals.protein}g
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">Carbs</p>
                          <p className="font-display text-xl text-foreground">
                            {editableTotals.carbs}g
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">Fat</p>
                          <p className="font-display text-xl text-foreground">
                            {editableTotals.fat}g
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Reference-only disclaimer */}
                  <div className="flex items-start gap-2 px-1">
                    <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Scans are for reference only — details may vary. Missing or wrong ingredient?
                      Tap the pencil to edit, or add anything the scanner missed below.
                    </p>
                  </div>

                  {/* Individual items */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                      Identified Items ({editableItems.length})
                    </p>
                    {editableItems.map((item, index) => {
                      const isEditing = editingIndex === index;
                      return (
                        <Card
                          key={index}
                          className={`border transition-all ${
                            loggedItems.has(index)
                              ? 'border-primary/30 bg-primary/5'
                              : isEditing
                              ? 'border-primary/40'
                              : 'border-border hover:border-primary/30'
                          }`}
                        >
                          <CardContent className="p-3">
                            {isEditing ? (
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <Input
                                    value={item.name}
                                    onChange={(e) => updateEditableItem(index, { name: e.target.value })}
                                    placeholder="Food name"
                                    className="h-8 text-sm flex-1"
                                  />
                                  <Input
                                    value={item.portion}
                                    onChange={(e) => updateEditableItem(index, { portion: e.target.value })}
                                    placeholder="Portion"
                                    className="h-8 text-sm flex-1"
                                  />
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                  <Input
                                    type="number"
                                    value={item.calories}
                                    onChange={(e) => updateEditableItem(index, { calories: Number(e.target.value) })}
                                    placeholder="kcal"
                                    className="h-8 text-xs"
                                  />
                                  <Input
                                    type="number"
                                    value={item.protein}
                                    onChange={(e) => updateEditableItem(index, { protein: Number(e.target.value) })}
                                    placeholder="P (g)"
                                    className="h-8 text-xs"
                                  />
                                  <Input
                                    type="number"
                                    value={item.carbs}
                                    onChange={(e) => updateEditableItem(index, { carbs: Number(e.target.value) })}
                                    placeholder="C (g)"
                                    className="h-8 text-xs"
                                  />
                                  <Input
                                    type="number"
                                    value={item.fat}
                                    onChange={(e) => updateEditableItem(index, { fat: Number(e.target.value) })}
                                    placeholder="F (g)"
                                    className="h-8 text-xs"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                                    onClick={() => handleRemoveItem(index)}
                                  >
                                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                                    Remove
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="flex-1 bg-primary hover:bg-primary/90"
                                    onClick={() => setEditingIndex(null)}
                                  >
                                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                    Done
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-semibold text-sm truncate">{item.name || 'Untitled item'}</p>
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
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    onClick={() => setEditingIndex(index)}
                                    aria-label="Edit item"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={loggedItems.has(index) ? 'ghost' : 'outline'}
                                    className={
                                      loggedItems.has(index)
                                        ? 'text-primary cursor-default'
                                        : 'border-primary/30 hover:bg-primary/10'
                                    }
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
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-dashed border-primary/30 text-primary hover:bg-primary/10"
                      onClick={handleAddMissingItem}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add missed ingredient
                    </Button>
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
                    {!allLogged && editableItems.length > 0 && (
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
