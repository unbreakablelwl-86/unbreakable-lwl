import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useExerciseVideos } from '@/hooks/useExerciseVideos';
import { useAIPreferences } from '@/hooks/useAIPreferences';
import {
  Video,
  Upload,
  Loader2,
  Camera,
  X,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface VideoRecorderProps {
  sessionId?: string;
  exerciseLogId?: string;
  exerciseName: string;
  onVideoRecorded?: (videoId: string) => void;
}

type PermissionState = 'prompt' | 'granted' | 'denied' | 'error' | 'checking';

export function VideoRecorder({
  sessionId,
  exerciseLogId,
  exerciseName,
  onVideoRecorded,
}: VideoRecorderProps) {
  const { uploadVideo, requestAnalysis } = useExerciseVideos(sessionId);
  const { preferences } = useAIPreferences();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Camera permission and error states
  const [permissionState, setPermissionState] = useState<PermissionState>('prompt');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Check camera permission on mount
  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    setPermissionState('checking');
    setCameraError(null);
    
    try {
      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera API not available. Please use a modern browser with HTTPS.');
        setPermissionState('error');
        return;
      }

      // Check permission status if available
      if (navigator.permissions) {
        try {
          const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
          setPermissionState(result.state as PermissionState);
          
          result.onchange = () => {
            setPermissionState(result.state as PermissionState);
          };
        } catch {
          // Permission query not supported, we'll check on first use
          setPermissionState('prompt');
        }
      } else {
        setPermissionState('prompt');
      }
    } catch (err) {
      console.error('Permission check error:', err);
      setPermissionState('prompt');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadVideo.mutateAsync({
      file,
      exerciseName,
      sessionId,
      exerciseLogId,
    });

    if (preferences?.movement_analysis_enabled) {
      await requestAnalysis.mutateAsync(result.id);
    }

    onVideoRecorded?.(result.id);
  };

  const startRecording = async () => {
    setIsInitializing(true);
    setCameraError(null);
    
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setPermissionState('granted');
      streamRef.current = stream;
      setIsRecording(true); // Set recording state early so video element renders
      
      // Use requestAnimationFrame to ensure DOM has updated with video element
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      
      // Now assign stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready and playing
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) return reject('No video element');
          
          const handleLoadedMetadata = () => {
            videoRef.current?.play()
              .then(() => {
                // Camera preview ready
                resolve();
              })
              .catch(reject);
          };
          
          // Check if already loaded
          if (videoRef.current.readyState >= 1) {
            handleLoadedMetadata();
          } else {
            videoRef.current.onloadedmetadata = handleLoadedMetadata;
          }
          videoRef.current.onerror = () => reject('Video element error');
        });
      } else {
        console.error('Video ref not available after DOM update');
      }

      // Check MediaRecorder support
      if (!window.MediaRecorder) {
        throw new Error('MediaRecorder not supported in this browser');
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
          ? 'video/webm;codecs=vp9'
          : 'video/webm',
      });
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
        setPreviewUrl(URL.createObjectURL(blob));
        
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      };

      mediaRecorder.start();
      // Recording state already set above to ensure video element is mounted
    } catch (err: any) {
      console.error('Failed to start recording:', err);
      setIsRecording(false); // Reset on error
      
      // Handle specific error types
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionState('denied');
        setCameraError('Camera access denied. Please allow camera access in your browser settings and refresh.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found. Please connect a camera and try again.');
        setPermissionState('error');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('Camera is in use by another application. Please close other apps using the camera.');
        setPermissionState('error');
      } else if (err.name === 'OverconstrainedError') {
        setCameraError('Camera does not meet requirements. Trying with default settings...');
        // Retry with basic constraints
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          streamRef.current = fallbackStream;
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            await videoRef.current.play();
          }
          setPermissionState('granted');
          setCameraError(null);
        } catch (fallbackErr) {
          setCameraError('Camera initialization failed. Please try again.');
          setPermissionState('error');
        }
      } else if (err.name === 'SecurityError') {
        setCameraError('Camera access requires HTTPS. Please ensure you are on a secure connection.');
        setPermissionState('error');
      } else {
        setCameraError(err.message || 'Failed to access camera. Please try again.');
        setPermissionState('error');
      }
    } finally {
      setIsInitializing(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleUploadRecorded = async () => {
    if (!recordedBlob) return;

    const file = new File([recordedBlob], `${exerciseName}-${Date.now()}.webm`, {
      type: 'video/webm',
    });

    const result = await uploadVideo.mutateAsync({
      file,
      exerciseName,
      sessionId,
      exerciseLogId,
    });

    if (preferences?.movement_analysis_enabled) {
      await requestAnalysis.mutateAsync(result.id);
    }

    setRecordedBlob(null);
    setPreviewUrl(null);
    onVideoRecorded?.(result.id);
  };

  const cancelRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setRecordedBlob(null);
    setPreviewUrl(null);
    setIsRecording(false);
  };

  // Render error state
  if (cameraError || permissionState === 'denied') {
    return (
      <div className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Card className="p-6 border-destructive/30 bg-destructive/5 border-border bg-card">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h4 className="font-display text-foreground mb-1">Camera Access Issue</h4>
              <p className="text-sm text-muted-foreground">
                {cameraError || 'Camera permission was denied'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCameraError(null);
                  checkCameraPermission();
                }}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Instead
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!isRecording && !previewUrl ? (
        <div className="space-y-3">
          {/* Permission status indicator */}
          {permissionState === 'checking' && (
            <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Checking camera access...</span>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadVideo.isPending}
              className="flex-1 gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Video
            </Button>
            <Button
              variant="outline"
              onClick={startRecording}
              disabled={isInitializing || permissionState === 'checking'}
              className="flex-1 gap-2"
            >
              {isInitializing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              {isInitializing ? 'Starting...' : 'Record'}
            </Button>
          </div>
        </div>
      ) : isRecording ? (
        <div className="space-y-3">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {/* Key fix: Ensure video element is always mounted and visible during recording */}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                transform: 'scaleX(-1)', // Mirror for selfie-style preview
              }}
            />
            {/* Recording indicator overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-2 right-2">
                <Badge variant="destructive" className="animate-pulse gap-1 shadow-lg">
                  <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                  REC
                </Badge>
              </div>
              {/* Border glow to indicate recording */}
              <div className="absolute inset-0 border-2 border-destructive/50 rounded-lg" />
            </div>
          </div>
          <Button
            variant="destructive"
            onClick={stopRecording}
            className="w-full gap-2"
          >
            <X className="w-4 h-4" />
            Stop Recording
          </Button>
        </div>
      ) : previewUrl ? (
        <div className="space-y-3">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              src={previewUrl}
              controls
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={cancelRecording}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadRecorded}
              disabled={uploadVideo.isPending}
              className="flex-1 gap-2"
            >
              {uploadVideo.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Save
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
