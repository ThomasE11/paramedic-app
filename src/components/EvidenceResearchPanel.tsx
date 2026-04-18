/**
 * EvidenceResearchPanel — "Why did we do that?"
 *
 * Post-case evidence-based-practice discussion surface, gated to 3rd/4th
 * year students. Each topic (e.g. "Why withhold drugs <30 °C?") opens a
 * horizontal mind-map card with the five EBM questions for every
 * landmark trial that informs the protocol:
 *
 *   WHO  → WHY  → HOW  → FINDINGS  → MEANING
 *
 * The panel sits as a collapsed card in the Session Summary until the
 * student opens it. Relevance is computed from the case's category,
 * subcategory, and the treatments they actually applied — so a hypo-
 * thermic drowning case shows hypothermia + airway + post-ROSC TTM
 * evidence, not TXA or sepsis.
 */

import { useMemo, useState } from 'react';
import {
  BookOpen, ChevronRight, ExternalLink, GraduationCap, Microscope,
  Users, HelpCircle, FlaskConical, Target, Sparkles, Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ABCDE_META } from '@/lib/abcdeClassifier';
import {
  getRelevantEvidence,
  type EvidenceTopic,
  type ResearchPaper,
} from '@/data/evidenceLibrary';

interface EvidenceResearchPanelProps {
  caseCategory: string;
  caseSubcategory: string;
  appliedTreatmentIds: string[];
  studentYear: string;
}

export function EvidenceResearchPanel({
  caseCategory,
  caseSubcategory,
  appliedTreatmentIds,
  studentYear,
}: EvidenceResearchPanelProps) {
  const topics = useMemo(
    () => getRelevantEvidence(caseCategory, caseSubcategory, appliedTreatmentIds, studentYear),
    [caseCategory, caseSubcategory, appliedTreatmentIds, studentYear],
  );

  // Gated out for 1st/2nd year or diploma — they get the clinical summary
  // without the EBM deep-dive.
  if (topics.length === 0) return null;

  return (
    <Card className="animate-fade-in-up stagger-8 border-l-4 border-l-indigo-500 rounded-2xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/30 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
            <Microscope className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span>Why did we do that?</span>
          <Badge variant="secondary" className="ml-auto text-[10px] gap-1">
            <GraduationCap className="w-3 h-3" />
            Y{studentYear === '4th-year' ? '3–4' : '3'} · Evidence-based practice
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1 pl-11">
          The landmark trials that inform the guidelines you just followed. Each study broken down into <strong>who, why, how, findings, meaning</strong>.
        </p>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        {topics.map((topic, i) => (
          <TopicCard key={topic.id} topic={topic} animationDelay={i * 80} />
        ))}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// Per-topic collapsible card
// =============================================================================

function TopicCard({
  topic,
  animationDelay,
}: {
  topic: EvidenceTopic;
  animationDelay: number;
}) {
  const [open, setOpen] = useState(false);
  const channelMeta = topic.channel ? ABCDE_META[topic.channel] : null;

  return (
    <div
      className={`rounded-xl border transition-all animate-slide-in ${
        open
          ? 'border-primary/30 shadow-md'
          : 'border-border hover:border-primary/30 hover:shadow-sm'
      } ${channelMeta ? `border-l-[3px] ${channelMeta.railClass}` : ''}`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* ---- Topic header (always visible) ---- */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-start gap-3 text-left p-4 hover:bg-muted/30 rounded-xl transition-colors"
      >
        <div className="p-1.5 rounded-lg bg-primary/10 shrink-0 mt-0.5">
          <HelpCircle className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-semibold leading-snug">{topic.question}</span>
            {channelMeta && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${channelMeta.chipClass}`}>
                {channelMeta.channel} · {channelMeta.label}
              </span>
            )}
            <Badge variant="outline" className="text-[10px] gap-1">
              <FlaskConical className="w-3 h-3" />
              {topic.papers.length} {topic.papers.length === 1 ? 'study' : 'studies'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground/80">Protocol:</span>{' '}
            {topic.practiceStatement}
          </p>
        </div>
        <ChevronRight
          className={`h-4 w-4 text-muted-foreground shrink-0 mt-1 transition-transform ${open ? 'rotate-90' : ''}`}
        />
      </button>

      {/* ---- Expanded mind-map grid ---- */}
      {open && (
        <div className="border-t border-border/50 p-4 pt-5 space-y-4 bg-muted/20">
          {topic.papers.map(paper => (
            <PaperMindMap key={paper.id} paper={paper} />
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// 5-column mind-map for a single paper
// =============================================================================

function PaperMindMap({ paper }: { paper: ResearchPaper }) {
  // Each of the five facets gets its own accent colour so the row reads
  // as a process, not a wall of text.
  const FACETS: Array<{
    key: keyof Pick<ResearchPaper, 'who' | 'why' | 'how' | 'findings' | 'meaning'>;
    label: string;
    icon: React.ReactNode;
    colour: string;
  }> = [
    { key: 'who',       label: 'Who did it',    icon: <Users className="w-3.5 h-3.5" />,          colour: 'border-sky-500/40 bg-sky-500/5' },
    { key: 'why',       label: 'Why',           icon: <HelpCircle className="w-3.5 h-3.5" />,     colour: 'border-amber-500/40 bg-amber-500/5' },
    { key: 'how',       label: 'How',           icon: <FlaskConical className="w-3.5 h-3.5" />,   colour: 'border-violet-500/40 bg-violet-500/5' },
    { key: 'findings',  label: 'What they found', icon: <Target className="w-3.5 h-3.5" />,        colour: 'border-emerald-500/40 bg-emerald-500/5' },
    { key: 'meaning',   label: 'What it means', icon: <Sparkles className="w-3.5 h-3.5" />,        colour: 'border-primary/40 bg-primary/5' },
  ];

  return (
    <div className="rounded-xl bg-card border border-border/60 p-4 space-y-3">
      {/* Paper citation */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            {paper.landmark && (
              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[10px] gap-1">
                <Star className="w-3 h-3 fill-current" />
                Landmark
              </Badge>
            )}
            <span className="font-semibold text-sm">{paper.shortName}</span>
            <span className="text-xs text-muted-foreground font-mono">· {paper.year}</span>
          </div>
          <p className="text-xs text-foreground/80 leading-snug">{paper.title}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 italic">
            {paper.authors} · <span className="not-italic font-medium">{paper.journal}</span>
          </p>
        </div>
        {paper.url && (
          <Button asChild size="sm" variant="outline" className="h-7 text-xs shrink-0">
            <a href={paper.url} target="_blank" rel="noopener noreferrer">
              <BookOpen className="w-3 h-3 mr-1.5" /> Read
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </Button>
        )}
      </div>

      {/* Mind-map row: 5 facet tiles */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        {FACETS.map(f => (
          <div
            key={f.key}
            className={`rounded-lg border ${f.colour} p-2.5 space-y-1.5`}
          >
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {f.icon}
              {f.label}
            </div>
            <p className="text-[11.5px] leading-[1.45] text-foreground/85">{paper[f.key]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EvidenceResearchPanel;
