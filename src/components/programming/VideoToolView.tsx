import { useState } from 'react';
import { FullScreenToolView } from './FullScreenToolView';
import { VideoRecorder } from './VideoRecorder';
import { useExerciseVideos } from '@/hooks/useExerciseVideos';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, Camera, PlayCircle, Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface VideoToolViewProps {
  sessionId?: string;
  exerciseName?: string;
  onClose: () => void;
}

export function VideoToolView({ sessionId, exerciseName, onClose }: VideoToolViewProps) {
  const [activeTab, setActiveTab] = useState<'record' | 'library'>('record');
  const { videos, isLoading, deleteVideo } = useExerciseVideos(sessionId);

  return (
    <FullScreenToolView
      title="EXERCISE VIDEO"
      subtitle={exerciseName || 'Record and review your form'}
      icon={<Video className="w-5 h-5" />}
      onClose={onClose}
    >
      <div className="space-y-4 max-w-2xl mx-auto">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'record' | 'library')}>
          <TabsList className="w-full">
            <TabsTrigger value="record" className="flex-1 gap-2">
              <Camera className="w-4 h-4" />
              Record
            </TabsTrigger>
            <TabsTrigger value="library" className="flex-1 gap-2">
              <PlayCircle className="w-4 h-4" />
              Library
            </TabsTrigger>
          </TabsList>

          <TabsContent value="record" className="mt-4">
            <Card className="p-4 border-border border-gray-800 bg-[#111]">
              <VideoRecorder
                sessionId={sessionId}
                exerciseName={exerciseName || 'Exercise'}
                onVideoRecorded={() => setActiveTab('library')}
              />
            </Card>
          </TabsContent>

          <TabsContent value="library" className="mt-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : videos && videos.length > 0 ? (
              videos.map((video) => (
                <Card key={video.id} className="p-4 border-border bg-card">
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                      {video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt={video.exercise_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <a
                        href={video.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <PlayCircle className="w-10 h-10 text-white" />
                      </a>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display text-foreground truncate">
                        {video.exercise_name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(video.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                      {video.duration_seconds && (
                        <p className="text-xs text-muted-foreground">
                          {Math.floor(video.duration_seconds / 60)}:{(video.duration_seconds % 60).toString().padStart(2, '0')}
                        </p>
                      )}
                      {video.analysis_status && (
                        <Badge
                          variant="outline"
                          className={
                            video.analysis_status === 'completed'
                              ? 'border-[#FF5500] text-[#FF5500]'
                              : video.analysis_status === 'pending'
                              ? 'border-[#FF5500] text-[#FF5500]'
                              : 'border-[#FF5500] text-[#FF5500]'
                          }
                        >
                          {video.analysis_status}
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteVideo.mutate(video.id)}
                      className="text-destructive hover:text-destructive shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center border-border border-gray-800 bg-[#111]">
                <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-lg text-foreground mb-2">No Videos Yet</h3>
                <p className="text-sm text-muted-foreground">
                  Record your form to get movement analysis feedback.
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </FullScreenToolView>
  );
}
