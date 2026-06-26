import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Image, Video, X, Loader2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface SocialMediaUploadProps {
  onImageUploaded: (url: string) => void;
  onVideoUploaded: (url: string) => void;
  currentImageUrl?: string;
  currentVideoUrl?: string;
  onClearImage?: () => void;
  onClearVideo?: () => void;
}

export function SocialMediaUpload({
  onImageUploaded,
  onVideoUploaded,
  currentImageUrl,
  currentVideoUrl,
  onClearImage,
  onClearVideo,
}: SocialMediaUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File, type: 'image' | 'video') => {
    if (!user) return;
    const maxSize = type === 'video' ? 500 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({ title: `File too large. Max ${type === 'video' ? '500MB' : '10MB'}`, variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('social-media').upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('social-media').getPublicUrl(fileName);
      if (type === 'image') onImageUploaded(urlData.publicUrl);
      else onVideoUploaded(urlData.publicUrl);
      toast({ title: `${type === 'image' ? 'Image' : 'Video'} uploaded!` });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-primary font-display tracking-widest">📎 ATTACH YOUR OWN MEDIA</p>
      <input ref={imageRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f, 'image'); e.target.value = ''; }} />
      <input ref={videoRef} type="file" accept="video/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f, 'video'); e.target.value = ''; }} />

      {uploading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin text-primary" /> Uploading...
        </div>
      )}

      <div className="flex gap-2">
        {!currentImageUrl && (
          <Button variant="outline" size="sm" onClick={() => imageRef.current?.click()} disabled={uploading}
            className="text-[10px] font-display gap-1.5">
            <Image className="w-3.5 h-3.5" /> UPLOAD IMAGE
          </Button>
        )}
        {!currentVideoUrl && (
          <Button variant="outline" size="sm" onClick={() => videoRef.current?.click()} disabled={uploading}
            className="text-[10px] font-display gap-1.5">
            <Video className="w-3.5 h-3.5" /> UPLOAD VIDEO
          </Button>
        )}
      </div>

      {currentImageUrl && (
        <div className="relative">
          <img loading="lazy" src={currentImageUrl} alt="Uploaded" className="w-full rounded-lg max-h-48 object-cover" />
          {onClearImage && (
            <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={onClearImage}>
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      )}
      {currentVideoUrl && (
        <div className="relative">
          <video src={currentVideoUrl} controls className="w-full rounded-lg max-h-48" />
          {onClearVideo && (
            <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={onClearVideo}>
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
