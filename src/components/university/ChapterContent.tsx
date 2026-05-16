import type { Chapter } from '@/lib/university/types';
import { UnbreakableInsightBox } from './UnbreakableInsightBox';
import { CoachNoteBox } from './CoachNoteBox';
import { ImagePlaceholder } from './ImagePlaceholder';
import { Card } from '@/components/ui/card';
import { CheckSquare, Target, ListChecks } from 'lucide-react';

interface Props {
  chapter: Chapter;
}

export function ChapterContent({ chapter }: Props) {
  return (
    <div className="space-y-8">
      {/* Learning Outcome */}
      <Card className="p-5 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-primary" />
          <p className="font-display text-xs tracking-wider text-primary">LEARNING OUTCOME</p>
        </div>
        <p className="text-sm text-foreground leading-relaxed">{chapter.learningOutcome}</p>
      </Card>

      {/* Assessment Criteria */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ListChecks className="w-4 h-4 text-muted-foreground" />
          <p className="font-display text-xs tracking-wider text-muted-foreground">ASSESSMENT CRITERIA</p>
        </div>
        <ul className="space-y-2">
          {chapter.assessmentCriteria.map((c, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="text-primary font-display text-xs mt-0.5 shrink-0">{i + 1}.</span>
              <span className="leading-relaxed">{c}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Content Sections */}
      {chapter.content.map((section, i) => (
        <div key={i} className="space-y-4">
          {section.heading && (
            <h3 className="font-display text-lg tracking-wider text-foreground pt-2">{section.heading}</h3>
          )}
          {section.paragraphs?.map((p, j) => (
            <p key={j} className="text-sm text-muted-foreground leading-[1.8]">{p}</p>
          ))}
          {section.bullets && (
            <ul className="space-y-2.5 ml-1">
              {section.bullets.map((b, j) => (
                <li key={j} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="text-primary mt-1.5 shrink-0">•</span>
                  <span className="leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          )}
          {section.imageUrl && (
            <div className="my-5 rounded-xl overflow-hidden border border-primary/20">
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
        </div>
      ))}

      {/* Unbreakable Insight */}
      <UnbreakableInsightBox text={chapter.unbreakableInsight} />

      {/* Coach's Note */}
      <CoachNoteBox text={chapter.coachNote} />

      {/* Practical Task */}
      <Card className="p-6 border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <CheckSquare className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display text-sm tracking-wider text-primary">PRACTICAL TASK</span>
        </div>
        <h4 className="text-foreground font-semibold text-sm mb-3">{chapter.practicalTask.title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">{chapter.practicalTask.instructions}</p>
        <div className="bg-muted/20 rounded-xl p-4 border border-border/50">
          <p className="text-xs font-display tracking-wider text-muted-foreground mb-3">REFLECTION QUESTIONS</p>
          <ul className="space-y-2">
            {chapter.practicalTask.reflectionQuestions.map((q, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-3">
                <span className="text-primary font-display text-xs mt-0.5 shrink-0">{i + 1}.</span>
                <span className="leading-relaxed">{q}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}
