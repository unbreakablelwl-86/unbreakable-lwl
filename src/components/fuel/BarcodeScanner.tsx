import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSavedFoods } from '@/hooks/useSavedFoods';
import { useFoodLogs } from '@/hooks/useFoodLogs';
import { useNutritionFeedback } from '@/hooks/useNutritionFeedback';
import { useFoodSearch, FoodSearchResult } from '@/hooks/useFoodSearch';
import { MealType, mealTypeLabels } from '@/lib/fuelTypes';
import { 
  Barcode, 
  Camera,
  SwitchCamera,
  Search, 
  Loader2,
  Flame,
  CheckCircle,
  MessageSquare,
  X,
  AlertCircle,
  Keyboard
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  mealType?: MealType;
}

type ScanMode = 'camera' | 'manual';
type CameraState = 'idle' | 'requesting' | 'active' | 'error' | 'denied';

export function BarcodeScanner({ isOpen, onClose, mealType = 'snack' }: BarcodeScannerProps) {
  const { saveFood } = useSavedFoods();
  const { addFoodLog } = useFoodLogs();
  const { analyzeFood, isAnalyzing } = useNutritionFeedback();
  const { lookupBarcode, isSearching } = useFoodSearch();
  
  const [mode, setMode] = useState<ScanMode>('camera');
  const [cameraState, setCameraState] = useState<CameraState>('idle');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannedItem, setScannedItem] = useState<FoodSearchResult | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealType>(mealType);
  const [servings, setServings] = useState(1);
  const [displayMode, setDisplayMode] = useState<'serving' | '100g'>('serving');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize canvas for barcode detection
  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
  }, []);

  // Start camera when modal opens in camera mode
  useEffect(() => {
    if (isOpen && mode === 'camera' && cameraState === 'idle') {
      startCamera();
    }
    
    return () => {
      if (!isOpen) {
        stopCamera();
        resetScanner();
      }
    };
  }, [isOpen, mode]);

  const startCamera = async () => {
    setCameraState('requesting');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraState('active');
        startBarcodeDetection();
      }
    } catch (error) {
      console.error('Camera error:', error);
      if ((error as Error).name === 'NotAllowedError') {
        setCameraState('denied');
      } else {
        setCameraState('error');
      }
      // Fall back to manual mode
      setMode('manual');
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraState('idle');
  };

  const startBarcodeDetection = () => {
    // Use BarcodeDetector API if available (Chrome, Edge)
    if ('BarcodeDetector' in window) {
      const barcodeDetector = new (window as any).BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'],
      });

      scanIntervalRef.current = setInterval(async () => {
        if (videoRef.current && videoRef.current.readyState === 4 && !scannedItem) {
          try {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              handleBarcodeDetected(code);
            }
          } catch (e) {
            // Detection failed, continue scanning
          }
        }
      }, 500);
    } else {
      // Fallback: prompt manual entry if BarcodeDetector not available
      toast.info('Camera scanning not supported on this device. Please enter barcode manually.');
      setMode('manual');
    }
  };

  const handleBarcodeDetected = async (code: string) => {
    if (scannedItem) return; // Already found something
    
    // Stop scanning while looking up
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    
    setBarcodeInput(code);
    await performLookup(code);
  };

  const performLookup = async (code: string) => {
    setNotFound(false);
    setAnalysis(null);
    
    const result = await lookupBarcode(code);
    
    if (result) {
      setScannedItem(result);
      stopCamera();
    } else {
      setNotFound(true);
      // Resume scanning after a delay
      if (mode === 'camera' && cameraState === 'active') {
        setTimeout(() => {
          startBarcodeDetection();
        }, 2000);
      }
    }
  };

  const handleManualSearch = async () => {
    if (!barcodeInput.trim()) return;
    await performLookup(barcodeInput.trim());
  };

  const handleGetFeedback = async () => {
    if (!scannedItem) return;
    
    const result = await analyzeFood('barcode', {
      name: scannedItem.brand ? `${scannedItem.brand} ${scannedItem.name}` : scannedItem.name,
      calories: scannedItem.calories,
      protein: scannedItem.protein,
      carbs: scannedItem.carbs,
      fat: scannedItem.fat,
      fiber: scannedItem.fiber,
      sugar: scannedItem.sugar,
      sodium: scannedItem.sodium,
      servingSize: scannedItem.servingSize,
    });
    
    if (result) {
      setAnalysis(result.analysis);
    }
  };

  const handleAddToLog = async () => {
    if (!scannedItem) return;
    
    const nutrition = getActiveNutrition();
    if (!nutrition) return;
    
    const servingSizeLabel = displayMode === 'serving' && scannedItem.hasServingData 
      ? scannedItem.servingSize 
      : '100g';
    
    await addFoodLog.mutateAsync({
      food_name: scannedItem.name,
      brand: scannedItem.brand,
      barcode: scannedItem.barcode || barcodeInput,
      serving_size: servingSizeLabel,
      calories: nutrition.calories,
      protein_g: nutrition.protein,
      carbs_g: nutrition.carbs,
      fat_g: nutrition.fat,
      fiber_g: nutrition.fiber,
      sugar_g: nutrition.sugar,
      sodium_mg: nutrition.sodium,
      meal_type: selectedMeal,
      servings,
      logged_at: new Date().toISOString(),
    });
    
    // Save to store cupboard for future use (save per-100g for consistency)
    const per100g = scannedItem.per100g || {
      calories: scannedItem.calories,
      protein: scannedItem.protein,
      carbs: scannedItem.carbs,
      fat: scannedItem.fat,
      fiber: scannedItem.fiber,
      sugar: scannedItem.sugar,
      sodium: scannedItem.sodium,
    };
    
    saveFood.mutate({
      food_name: scannedItem.name,
      brand: scannedItem.brand,
      barcode: scannedItem.barcode || barcodeInput,
      serving_size: scannedItem.servingSize,
      calories: per100g.calories,
      protein_g: per100g.protein,
      carbs_g: per100g.carbs,
      fat_g: per100g.fat,
      fiber_g: per100g.fiber,
      sugar_g: per100g.sugar,
      sodium_mg: per100g.sodium,
      is_favourite: false,
    });
    
    toast.success('Added to food log');
    onClose();
  };

  const resetScanner = () => {
    setBarcodeInput('');
    setScannedItem(null);
    setAnalysis(null);
    setNotFound(false);
    setServings(1);
    setDisplayMode('serving');
  };

  // Get the active nutrition values based on display mode
  const getActiveNutrition = () => {
    if (!scannedItem) return null;
    
    // If no serving data available, always use per100g
    if (!scannedItem.hasServingData) {
      return scannedItem.per100g || {
        calories: scannedItem.calories,
        protein: scannedItem.protein,
        carbs: scannedItem.carbs,
        fat: scannedItem.fat,
        fiber: scannedItem.fiber,
        sugar: scannedItem.sugar,
        sodium: scannedItem.sodium,
      };
    }
    
    return displayMode === 'serving' 
      ? (scannedItem.perServing || scannedItem.per100g)
      : scannedItem.per100g;
  };

  const handleScanAnother = () => {
    resetScanner();
    if (mode === 'camera') {
      startCamera();
    }
  };

  const switchMode = (newMode: ScanMode) => {
    if (newMode === mode) return;
    
    stopCamera();
    resetScanner();
    setMode(newMode);
    
    if (newMode === 'camera') {
      setTimeout(() => startCamera(), 100);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        stopCamera();
        onClose();
      }
    }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col bg-[#0a0a0a] border-gray-800">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wide flex items-center gap-2">
            <Barcode className="w-5 h-5 text-primary" />
            SCAN FOOD
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Mode Toggle */}
          {!scannedItem && (
            <div className="flex gap-2">
              <Button
                variant={mode === 'camera' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 gap-2"
                onClick={() => switchMode('camera')}
              >
                <Camera className="w-4 h-4" />
                Camera
              </Button>
              <Button
                variant={mode === 'manual' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 gap-2"
                onClick={() => switchMode('manual')}
              >
                <Keyboard className="w-4 h-4" />
                Manual
              </Button>
            </div>
          )}

          {/* Camera View */}
          {mode === 'camera' && !scannedItem && (
            <div className="space-y-3">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                {cameraState === 'requesting' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                )}
                
                {cameraState === 'denied' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    <AlertCircle className="w-10 h-10 text-destructive mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Camera access denied. Please enable camera permissions or use manual entry.
                    </p>
                  </div>
                )}
                
                {cameraState === 'error' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    <AlertCircle className="w-10 h-10 text-destructive mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Could not access camera. Try manual entry instead.
                    </p>
                  </div>
                )}
                
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                
                {cameraState === 'active' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-32 border-2 border-primary rounded-lg">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
                    </div>
                  </div>
                )}

                {isSearching && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-card p-4 rounded-lg flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span className="text-sm">Looking up product...</span>
                    </div>
                  </div>
                )}
              </div>
              
              <p className="text-xs text-center text-muted-foreground">
                Position barcode within the frame to scan
              </p>
            </div>
          )}

          {/* Manual Entry */}
          {mode === 'manual' && !scannedItem && (
            <div className="space-y-2">
              <Label>Enter Barcode Number</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., 5000112611793"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                />
                <Button 
                  onClick={handleManualSearch} 
                  disabled={isSearching || !barcodeInput.trim()}
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Find the barcode number on the product packaging
              </p>
            </div>
          )}

          {/* Not Found Message */}
          <AnimatePresence>
            {notFound && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card className="border-destructive/50 bg-destructive/5 border-gray-800 bg-[#111]">
                  <CardContent className="p-4 text-center">
                    <X className="w-8 h-8 text-destructive mx-auto mb-2" />
                    <p className="font-medium">Product not found</p>
                    <p className="text-sm text-muted-foreground">
                      {mode === 'camera' ? 'Scanning again...' : 'Add it manually in your Store Cupboard'}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scanned Item */}
          <AnimatePresence>
            {scannedItem && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <Card className="border-primary/50 bg-primary/5 border-gray-800 bg-[#111]">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        {scannedItem.imageUrl && (
                          <img 
                            src={scannedItem.imageUrl} 
                            alt={scannedItem.name}
                            className="w-16 h-16 object-contain rounded-lg bg-white"
                          />
                        )}
                        <div>
                          {scannedItem.brand && (
                            <Badge variant="secondary" className="mb-1">{scannedItem.brand}</Badge>
                          )}
                          <CardTitle className="font-display text-lg">{scannedItem.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{scannedItem.servingSize}</p>
                          {scannedItem.source === 'user_library' && (
                            <Badge variant="outline" className="mt-1 text-xs">From your library</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Display Mode Toggle */}
                    {scannedItem.hasServingData && (
                      <div className="flex gap-2">
                        <Button
                          variant={displayMode === 'serving' ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => setDisplayMode('serving')}
                        >
                          Per Serving ({scannedItem.servingSize})
                        </Button>
                        <Button
                          variant={displayMode === '100g' ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => setDisplayMode('100g')}
                        >
                          Per 100g
                        </Button>
                      </div>
                    )}

                    {/* Nutrition Display */}
                    {(() => {
                      const nutrition = getActiveNutrition();
                      if (!nutrition) return null;
                      
                      return (
                        <>
                          <div className="flex items-center justify-center gap-2 p-3 bg-primary/10 rounded-lg">
                            <p className="font-display text-3xl text-primary">{nutrition.calories}</p>
                            <div className="text-left">
                              <p className="text-xs text-muted-foreground">kcal</p>
                              <p className="text-xs text-muted-foreground">
                                {displayMode === 'serving' && scannedItem.hasServingData 
                                  ? `per ${scannedItem.servingSize}` 
                                  : 'per 100g'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-2 bg-muted/30 rounded-lg">
                              <p className="font-display text-primary">{nutrition.protein}g</p>
                              <p className="text-xs text-muted-foreground">Protein</p>
                            </div>
                            <div className="p-2 bg-muted/30 rounded-lg">
                              <p className="font-display text-primary">{nutrition.carbs}g</p>
                              <p className="text-xs text-muted-foreground">Carbs</p>
                            </div>
                            <div className="p-2 bg-muted/30 rounded-lg">
                              <p className="font-display text-primary">{nutrition.fat}g</p>
                              <p className="text-xs text-muted-foreground">Fat</p>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Servings & Meal Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Servings</Label>
                    <Input
                      type="number"
                      min={0.5}
                      step={0.5}
                      value={servings}
                      onChange={(e) => setServings(parseFloat(e.target.value) || 1)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Meal</Label>
                    <div className="flex flex-wrap gap-1">
                      {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((meal) => (
                        <Badge
                          key={meal}
                          variant={selectedMeal === meal ? 'default' : 'outline'}
                          className="cursor-pointer text-xs"
                          onClick={() => setSelectedMeal(meal)}
                        >
                          {mealTypeLabels[meal]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Calculated Totals */}
                {servings !== 1 && (() => {
                  const nutrition = getActiveNutrition();
                  if (!nutrition) return null;
                  return (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Total for {servings} servings:</p>
                      <p className="font-display text-primary">
                        {Math.round(nutrition.calories * servings)} kcal · 
                        P: {Math.round(nutrition.protein * servings)}g · 
                        C: {Math.round(nutrition.carbs * servings)}g · 
                        F: {Math.round(nutrition.fat * servings)}g
                      </p>
                    </div>
                  );
                })()}

                {/* AI Feedback Button */}
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleGetFeedback}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MessageSquare className="w-4 h-4" />
                  )}
                  GET COACH FEEDBACK
                </Button>

                {/* AI Analysis */}
                <AnimatePresence>
                  {analysis && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Card className="border-primary/30 border-gray-800 bg-[#111]">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-display flex items-center gap-2">
                            <Flame className="w-4 h-4 text-primary" />
                            COACH ANALYSIS
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="max-h-48">
                            <div className="prose prose-sm dark:prose-invert">
                              <ReactMarkdown>{analysis}</ReactMarkdown>
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={handleScanAnother}>
                    Scan Another
                  </Button>
                  <Button 
                    className="flex-1 gap-2 font-display" 
                    onClick={handleAddToLog}
                    disabled={addFoodLog.isPending}
                  >
                    {addFoodLog.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    ADD TO LOG
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
