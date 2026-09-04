import { useState, useRef, useCallback, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMentionPrediction, MentionSuggestion } from '@/hooks/useMentionPrediction';
import { useHashtagPrediction } from '@/hooks/useHashtagPrediction';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  enableHashtags?: boolean;
  enableMentions?: boolean;
  minHeight?: string;
  maxHeight?: string;
  /** Hard character cap — further input is blocked once reached, and a counter shows near the limit. */
  maxLength?: number;
}

export function MentionTextarea({
  value,
  onChange,
  placeholder = "Write something...",
  className,
  onKeyDown,
  onFocus,
  onBlur,
  enableHashtags = true,
  enableMentions = true,
  minHeight = "40px",
  maxHeight = "120px",
  maxLength,
}: MentionTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  
  // Mention state
  const { getMentionSuggestions, detectMention, insertMention } = useMentionPrediction();
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionSuggestion[]>([]);
  
  // Hashtag state
  const { getPredictions, extractAndSaveHashtags } = useHashtagPrediction();
  const [showHashtags, setShowHashtags] = useState(false);
  const [hashtagPredictions, setHashtagPredictions] = useState<string[]>([]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursor = e.target.selectionStart || 0;
    
    onChange(newValue);
    setCursorPosition(cursor);

    // Check for mentions
    if (enableMentions) {
      const { isMentioning, query } = detectMention(newValue, cursor);
      if (isMentioning) {
        const suggestions = getMentionSuggestions(query);
        setMentionSuggestions(suggestions);
        setShowMentions(suggestions.length > 0);
        setShowHashtags(false);
      } else {
        setShowMentions(false);
      }
    }

    // Check for hashtags (only if not mentioning)
    if (enableHashtags && !showMentions) {
      const textBeforeCursor = newValue.slice(0, cursor);
      const hashtagMatch = textBeforeCursor.match(/#(\w*)$/);
      
      if (hashtagMatch) {
        const partial = hashtagMatch[1];
        const preds = getPredictions(partial);
        setHashtagPredictions(preds);
        setShowHashtags(preds.length > 0);
      } else {
        setShowHashtags(false);
      }
    }
  }, [onChange, enableMentions, enableHashtags, detectMention, getMentionSuggestions, getPredictions, showMentions]);

  const handleMentionSelect = useCallback((suggestion: MentionSuggestion) => {
    const { newText, newCursorPosition } = insertMention(value, cursorPosition, suggestion);
    onChange(newText);
    setShowMentions(false);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  }, [value, cursorPosition, insertMention, onChange]);

  const handleHashtagSelect = useCallback((hashtag: string) => {
    const textBeforeCursor = value.slice(0, cursorPosition);
    const textAfterCursor = value.slice(cursorPosition);
    
    const hashtagStart = textBeforeCursor.lastIndexOf('#');
    if (hashtagStart === -1) return;

    const newContent = textBeforeCursor.slice(0, hashtagStart) + '#' + hashtag + ' ' + textAfterCursor;
    onChange(newContent);
    setShowHashtags(false);

    // Save hashtag for future predictions
    extractAndSaveHashtags('#' + hashtag);

    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = hashtagStart + hashtag.length + 2;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }, [value, cursorPosition, onChange, extractAndSaveHashtags]);

  const handleBlur = useCallback(() => {
    // Delay hiding to allow click on suggestions
    setTimeout(() => {
      setShowMentions(false);
      setShowHashtags(false);
    }, 200);
    onBlur?.();
  }, [onBlur]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative w-full">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn("resize-none", className)}
        style={{ minHeight, maxHeight }}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={handleBlur}
        maxLength={maxLength}
      />

      {/* Character counter — only shown once there's a cap and the user's getting close to it */}
      {maxLength && value.length >= maxLength * 0.8 && (
        <div
          className={cn(
            "absolute bottom-1 right-2 text-xs pointer-events-none",
            value.length >= maxLength ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {value.length}/{maxLength}
        </div>
      )}

      {/* Mention Suggestions Dropdown */}
      <AnimatePresence>
        {showMentions && mentionSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 top-full mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden"
          >
            {mentionSuggestions.map((suggestion) => (
              <button
                key={suggestion.userId}
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-muted transition-colors flex items-center gap-2"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleMentionSelect(suggestion);
                }}
              >
                <Avatar className="w-6 h-6">
                  <AvatarImage src={suggestion.avatarUrl || undefined} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {getInitials(suggestion.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {suggestion.displayName}
                  </p>
                  {suggestion.username && (
                    <p className="text-xs text-muted-foreground truncate">
                      @{suggestion.username}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hashtag Predictions Dropdown */}
      <AnimatePresence>
        {showHashtags && hashtagPredictions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 top-full mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden"
          >
            {hashtagPredictions.map((tag) => (
              <button
                key={tag}
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-muted transition-colors text-sm"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleHashtagSelect(tag);
                }}
              >
                <span className="text-primary">#</span>{tag}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
