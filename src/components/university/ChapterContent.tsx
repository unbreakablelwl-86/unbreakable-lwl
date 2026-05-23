import { motion } from 'framer-motion';
import type { Chapter } from '@/lib/university/types';
import { UnbreakableInsightBox } from './UnbreakableInsightBox';
import { CoachNoteBox } from './CoachNoteBox';
import { ImagePlaceholder } from './ImagePlaceholder';
import { Card } from '@/components/ui/card';
import { CheckSquare, Target, ListChecks, Lightbulb, Dumbbell } from 'lucide-react';

interface Props {
  chapter: Chapter;
}

const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

/** Detect sport chapters — content is a single string instead of ContentSection[] */
function isSportChapter(chapter: Chapter): boolean {
  return typeof chapter.content === 'string';
}

/** Render sport-format chapter (content as string, keyTakeaways, practicalApplication) */
function SportChapterContent({ chapter }: Props) {
  const ch = chapter as Chapter & { keyTakeaways?: string; practicalApplication?: string; description?: string };
  const paragraphs = typeof ch.content === 'string' ? ch.content.split('\n\n').filter(Boolean) : [];
  const takeaways = ch.keyTakeaways?.split('\n').filter(Boolean) || [];
  const practicalApp = ch.practicalApplication || '';

  return (
    <div className="space-y-8">
      {/* Description */}
      {ch.description && (
        <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
          <Card className="p-5 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden border-gray-800 bg-[#111]">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-primary" />
                <p className="font-display text-xs tracking-wider text-primary">OVERVIEW</p>
              </div>
              <p className="text-sm text-foreground leading-[1.8]">{ch.description}</p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Main Content (string split into paragraphs) */}
      {paragraphs.map((p, i) => (
        <motion.div key={i} {...fadeIn} transition={{ delay: 0.15 + i * 0.04 }}>
          <p className="text-sm text-muted-foreground leading-[1.9] tracking-wide">{p}</p>
        </motion.div>
      ))}

      {/* Key Takeaways */}
      {takeaways.length > 0 && (
        <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
          <Card className="p-5 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden border-gray-800 bg-[#111]">
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-primary" />
                <p className="font-display text-xs tracking-wider text-primary">KEY TAKEAWAYS</p>
              </div>
              <ul className="space-y-2.5">
                {takeaways.map((t, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="text-primary mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-primary/60" />
                    <span className="leading-[1.8]">{t.replace(/^[•\-]\s*/, '')}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Unbreakable Insight */}
      {ch.unbreakableInsight && (
        <motion.div {...fadeIn} transition={{ delay: 0.35 }}>
          <UnbreakableInsightBox text={ch.unbreakableInsight} />
        </motion.div>
      )}

      {/* Practical Application */}
      {practicalApp && (
        <motion.div {...fadeIn} transition={{ delay: 0.4 }}>
          <Card className="p-6 border-primary/20 bg-gradient-to-br from-card to-primary/5 relative overflow-hidden border-gray-800 bg-[#111]">
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Dumbbell className="w-4 h-4 text-primary" />
                </div>
                <span className="font-display text-sm tracking-wider text-primary">PRACTICAL APPLICATION</span>
              </div>
              <p className="text-sm text-muted-foreground leading-[1.8]">{practicalApp}</p>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

export function ChapterContent({ chapter }: Props) {
  // Route to sport renderer if content is a string
  if (isSportChapter(chapter)) {
    return <SportChapterContent chapter={chapter} />;
  }

  const contentSections = chapter.content as import('@/lib/university/types').ContentSection[];

  return (
    <div className="space-y-8">
      {/* Learning Outcome */}
      {chapter.learningOutcome && (
        <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
          <Card className="p-5 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden border-gray-800 bg-[#111]">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-primary" />
                <p className="font-display text-xs tracking-wider text-primary">LEARNING OUTCOME</p>
              </div>
              <p className="text-sm text-foreground leading-[1.8]">{chapter.learningOutcome}</p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Assessment Criteria */}
      {chapter.assessmentCriteria && chapter.assessmentCriteria.length > 0 && (
        <motion.div {...fadeIn} transition={{ delay: 0.15 }}>
          <div className="flex items-center gap-2 mb-3">
            <ListChecks className="w-4 h-4 text-muted-foreground" />
            <p className="font-display text-xs tracking-wider text-muted-foreground">ASSESSMENT CRITERIA</p>
          </div>
          <ul className="space-y-2.5">
            {chapter.assessmentCriteria.map((c, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground group">
                <span className="text-primary font-display text-xs mt-0.5 shrink-0 w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="leading-[1.8]">{c}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Content Sections */}
      {contentSections.map((section, i) => (
        <motion.div key={i} {...fadeIn} transition={{ delay: 0.2 + i * 0.05 }} className="space-y-4">
          {section.heading && (
            <h3 className="font-display text-lg tracking-wider text-foreground pt-3 border-t border-border/20 mt-6">
              {section.heading}
            </h3>
          )}
          {section.paragraphs?.map((p, j) => (
            <p key={j} className="text-sm text-muted-foreground leading-[1.9] tracking-wide">{p}</p>
          ))}
          {section.bullets && (
            <ul className="space-y-3 ml-1">
              {section.bullets.map((b, j) => (
                <li key={j} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="text-primary mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-primary/60" />
                  <span className="leading-[1.8]">{b}</span>
                </li>
              ))}
            </ul>
          )}
          {section.imageUrl && (
            <div className="my-5 rounded-xl overflow-hidden border border-primary/20 shadow-lg shadow-primary/5">
              <img
                src={section.imageUrl}
                alt={section.imageAlt || ''}
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          )}
          {section.imagePlaceholder && !section.imageUrl && (
            <ImagePlaceholder description={section.imagePlaceholder} />
          )}
        </motion.div>
      ))}

      {/* Unbreakable Insight */}
      {chapter.unbreakableInsight && (
        <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
          <UnbreakableInsightBox text={chapter.unbreakableInsight} />
        </motion.div>
      )}

      {/* Coach's Note */}
      {chapter.coachNote && (
        <motion.div {...fadeIn} transition={{ delay: 0.35 }}>
          <CoachNoteBox text={chapter.coachNote} />
        </motion.div>
      )}

      {/* Practical Task */}
      {chapter.practicalTask && (
        <motion.div {...fadeIn} transition={{ delay: 0.4 }}>
          <Card className="p-6 border-primary/20 bg-gradient-to-br from-card to-primary/5 relative overflow-hidden border-gray-800 bg-[#111]">
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                  <CheckSquare className="w-4 h-4 text-primary" />
                </div>
                <span className="font-display text-sm tracking-wider text-primary">PRACTICAL TASK</span>
              </div>
              <h4 className="text-foreground font-semibold text-sm mb-3">{chapter.practicalTask.title}</h4>
              <p className="text-sm text-muted-foreground leading-[1.8] mb-5">{chapter.practicalTask.instructions}</p>
              <div className="bg-muted/20 rounded-xl p-4 border border-border/50">
                <p className="text-xs font-display tracking-wider text-muted-foreground mb-3">REFLECTION QUESTIONS</p>
                <ul className="space-y-2.5">
                  {chapter.practicalTask.reflectionQuestions.map((q, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-3">
                      <span className="text-primary font-display text-xs mt-0.5 shrink-0 w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="leading-[1.8]">{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
