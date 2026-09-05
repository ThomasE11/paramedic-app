import { lazy, Suspense, useMemo, useState } from 'react';
import {
  Activity, Stethoscope,
  HeartPulse, Bone, Wind, Brain, Baby,
  HeartHandshake, Flame, FlaskConical, ArrowRight,
  BookOpen, Monitor, Users, Search, SlidersHorizontal,
  Timer, ShieldCheck, ClipboardCheck,
  Waves, PersonStanding, Thermometer, Droplets, UsersRound, House, ScanSearch
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { caseCategories, yearLevels } from '@/data/caseFilters';

const ClinicalReferenceDialog = lazy(() =>
  import('@/components/ClinicalReferenceDialog').then(m => ({ default: m.ClinicalReferenceDialog })),
);

interface LandingPageProps {
  onRoleSelect: (role: 'educator' | 'student' | 'classroom-host' | 'classroom-join', category?: string) => void;
  caseCount: number;
  /** Real per-category case counts. Empty until the case library finishes loading. */
  caseCountsByCategory: Record<string, number>;
}

type CategoryFilter = 'all' | 'high-acuity' | 'assessment' | 'procedures';
type CategoryTone = 'red' | 'orange' | 'sky' | 'indigo' | 'teal' | 'rose' | 'amber' | 'emerald';

interface CategoryMeta {
  /** Matches a `caseCategories` value — this is what the student filter receives. */
  slug: string;
  name: string;
  count: number;
  icon: typeof HeartPulse;
  tone: CategoryTone;
  track: string;
  summary: string;
  signal: string;
  focus: string[];
  filters: CategoryFilter[];
}

const categoryFilters: Array<{ value: CategoryFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'high-acuity', label: 'High acuity' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'procedures', label: 'Procedures' },
];

const categoryToneClass: Record<CategoryTone, { accent: string; icon: string; chip: string }> = {
  red: {
    accent: 'from-red-500 via-rose-400 to-amber-300',
    icon: 'bg-red-50 border-red-100 text-red-600 dark:bg-red-500/10 dark:border-red-400/20 dark:text-red-300',
    chip: 'bg-red-50 text-red-700 border-red-100 dark:bg-red-500/10 dark:text-red-200 dark:border-red-400/20',
  },
  orange: {
    accent: 'from-orange-500 via-amber-400 to-red-400',
    icon: 'bg-orange-50 border-orange-100 text-orange-600 dark:bg-orange-500/10 dark:border-orange-400/20 dark:text-orange-300',
    chip: 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-500/10 dark:text-orange-200 dark:border-orange-400/20',
  },
  sky: {
    accent: 'from-sky-500 via-cyan-400 to-teal-300',
    icon: 'bg-sky-50 border-sky-100 text-sky-600 dark:bg-sky-500/10 dark:border-sky-400/20 dark:text-sky-300',
    chip: 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-500/10 dark:text-sky-200 dark:border-sky-400/20',
  },
  indigo: {
    accent: 'from-indigo-500 via-blue-400 to-cyan-300',
    icon: 'bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:border-indigo-400/20 dark:text-indigo-300',
    chip: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-200 dark:border-indigo-400/20',
  },
  teal: {
    accent: 'from-teal-500 via-emerald-400 to-lime-300',
    icon: 'bg-teal-50 border-teal-100 text-teal-600 dark:bg-teal-500/10 dark:border-teal-400/20 dark:text-teal-300',
    chip: 'bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-500/10 dark:text-teal-200 dark:border-teal-400/20',
  },
  rose: {
    accent: 'from-rose-500 via-pink-400 to-orange-300',
    icon: 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-500/10 dark:border-rose-400/20 dark:text-rose-300',
    chip: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-400/20',
  },
  amber: {
    accent: 'from-amber-500 via-yellow-400 to-orange-300',
    icon: 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-500/10 dark:border-amber-400/20 dark:text-amber-300',
    chip: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-400/20',
  },
  emerald: {
    accent: 'from-emerald-500 via-teal-400 to-cyan-300',
    icon: 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-400/20 dark:text-emerald-300',
    chip: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-400/20',
  },
};

/**
 * Editorial copy per category slug. Counts are NOT stored here — they come from
 * the live case library, so the library grid can never drift from the data again.
 * Every key must exist in `caseCategories`; a missing key just falls back below.
 */
const categoryCopy: Record<string, Omit<CategoryMeta, 'slug' | 'name' | 'count'>> = {
  cardiac: {
    icon: HeartPulse,
    tone: 'red',
    track: 'High acuity',
    summary: 'MI, arrhythmias, cardiac arrest',
    signal: 'Rhythm recognition, defib timing, perfusion checks',
    focus: ['ECG', 'Defib', 'Perfusion'],
    filters: ['high-acuity', 'assessment', 'procedures'],
  },
  'cardiac-ecg': {
    icon: Activity,
    tone: 'red',
    track: 'Interpretation',
    summary: '12-lead interpretation and rhythm drills',
    signal: 'Axis, blocks, ischaemic patterns, STEMI mimics',
    focus: ['12-lead', 'Rhythm', 'STEMI'],
    filters: ['assessment'],
  },
  trauma: {
    icon: Bone,
    tone: 'orange',
    track: 'Scene control',
    summary: 'Blunt, penetrating, multi-system injury',
    signal: 'Catastrophic bleed, spinal motion, rapid transport decisions',
    focus: ['MARCH', 'Splints', 'Transport'],
    filters: ['high-acuity', 'assessment', 'procedures'],
  },
  respiratory: {
    icon: Wind,
    tone: 'sky',
    track: 'Airway focus',
    summary: 'Asthma, COPD, pneumothorax',
    signal: 'Work of breathing, oxygen choice, escalation to ventilation',
    focus: ['Oxygen', 'BVM', 'CPAP'],
    filters: ['high-acuity', 'assessment', 'procedures'],
  },
  neurological: {
    icon: Brain,
    tone: 'indigo',
    track: 'Assessment',
    summary: 'Stroke, seizure, altered LOC',
    signal: 'GCS, pupils, glucose, time-last-known-well',
    focus: ['FAST', 'GCS', 'Pupils'],
    filters: ['assessment', 'high-acuity'],
  },
  pediatric: {
    icon: Baby,
    tone: 'teal',
    track: 'Expert',
    summary: 'Age-specific emergencies',
    signal: 'Weight-based dosing, family communication, pediatric triangle',
    focus: ['Dosing', 'PALS', 'Family'],
    filters: ['assessment', 'procedures'],
  },
  obstetric: {
    icon: HeartHandshake,
    tone: 'rose',
    track: 'Expert',
    summary: 'Pregnancy and delivery complications',
    signal: 'Maternal assessment, fetal context, rapid escalation triggers',
    focus: ['Delivery', 'Bleeding', 'Shock'],
    filters: ['high-acuity', 'assessment', 'procedures'],
  },
  burns: {
    icon: Flame,
    tone: 'amber',
    track: 'Advanced',
    summary: 'Thermal, chemical, electrical burns',
    signal: 'Airway risk, TBSA estimate, cooling and analgesia sequencing',
    focus: ['TBSA', 'Airway', 'Analgesia'],
    filters: ['assessment', 'procedures'],
  },
  toxicology: {
    icon: FlaskConical,
    tone: 'emerald',
    track: 'Advanced',
    summary: 'Overdose and poisoning',
    signal: 'Toxidrome recognition, naloxone timing, airway protection',
    focus: ['Toxidrome', 'Antidote', 'Airway'],
    filters: ['assessment', 'procedures'],
  },
  metabolic: {
    icon: Droplets,
    tone: 'emerald',
    track: 'Assessment',
    summary: 'Hypoglycaemia, DKA, electrolyte crises',
    signal: 'BGL trends, dextrose vs glucagon, fluid and insulin context',
    focus: ['BGL', 'Dextrose', 'Fluids'],
    filters: ['assessment', 'procedures'],
  },
  environmental: {
    icon: Thermometer,
    tone: 'amber',
    track: 'Scene control',
    summary: 'Heat illness, hypothermia, drowning, envenomation',
    signal: 'Core temperature, active rewarming or cooling, scene hazards',
    focus: ['Temp', 'Rewarm', 'Hazards'],
    filters: ['high-acuity', 'assessment'],
  },
  psychiatric: {
    icon: Brain,
    tone: 'rose',
    track: 'Communication',
    summary: 'Acute behavioural disturbance and crisis presentations',
    signal: 'De-escalation first, capacity, restraint as a last resort',
    focus: ['De-escalation', 'Capacity', 'Safety'],
    filters: ['assessment'],
  },
  'anxiety-related': {
    icon: Waves,
    tone: 'teal',
    track: 'Communication',
    summary: 'Panic, hyperventilation, somatic presentations',
    signal: 'Excluding organic causes before reassurance and coaching',
    focus: ['Rule-out', 'Coaching', 'Rapport'],
    filters: ['assessment'],
  },
  'elderly-fall': {
    icon: PersonStanding,
    tone: 'indigo',
    track: 'Assessment',
    summary: 'Falls, frailty, and silent injury in older patients',
    signal: 'Cause of the fall, occult fracture, polypharmacy, non-conveyance risk',
    focus: ['Frailty', 'Silver trauma', 'Meds'],
    filters: ['assessment'],
  },
  'multiple-patients': {
    icon: UsersRound,
    tone: 'orange',
    track: 'Scene control',
    summary: 'Multi-casualty scenes and triage under pressure',
    signal: 'Triage sieve, resource requests, command and communication',
    focus: ['Triage', 'Command', 'Resources'],
    filters: ['high-acuity', 'procedures'],
  },
  'post-discharge': {
    icon: House,
    tone: 'sky',
    track: 'Continuity',
    summary: 'Deterioration and complications after hospital discharge',
    signal: 'Recent history, medication changes, re-presentation red flags',
    focus: ['History', 'Meds', 'Red flags'],
    filters: ['assessment'],
  },
  'rule-out': {
    icon: ScanSearch,
    tone: 'sky',
    track: 'Assessment',
    summary: 'Undifferentiated presentations needing exclusion',
    signal: 'Working through differentials without anchoring too early',
    focus: ['Differentials', 'Red flags', 'Safety net'],
    filters: ['assessment'],
  },
  general: {
    icon: Stethoscope,
    tone: 'teal',
    track: 'Foundations',
    summary: 'Core assessment and everyday callouts',
    signal: 'Clean ABCDE, history taking, and appropriate disposition',
    focus: ['ABCDE', 'History', 'Disposition'],
    filters: ['assessment'],
  },
};

const fallbackCopy: Omit<CategoryMeta, 'slug' | 'name' | 'count'> = {
  icon: Stethoscope,
  tone: 'teal',
  track: 'Assessment',
  summary: 'Clinical scenarios from the case library',
  signal: 'Structured assessment and treatment decisions',
  focus: ['ABCDE'],
  filters: ['assessment'],
};

export function LandingPage({ onRoleSelect, caseCount, caseCountsByCategory }: LandingPageProps) {
  const [categoryQuery, setCategoryQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  // The library is lazy-loaded, so counts arrive after first paint. Until they
  // do, show every category rather than an empty grid.
  const countsLoaded = caseCount > 0;

  const categories = useMemo<CategoryMeta[]>(() => (
    caseCategories
      .map(cat => ({
        slug: cat.value,
        name: cat.label,
        count: caseCountsByCategory[cat.value] ?? 0,
        ...(categoryCopy[cat.value] ?? fallbackCopy),
      }))
      // Never advertise a track with nothing behind it.
      .filter(cat => !countsLoaded || cat.count > 0)
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  ), [caseCountsByCategory, countsLoaded]);

  const visibleCategories = useMemo(() => {
    const query = categoryQuery.trim().toLowerCase();

    return categories.filter((cat) => {
      const matchesFilter = categoryFilter === 'all' || cat.filters.includes(categoryFilter);
      const matchesQuery = !query || [
        cat.name,
        cat.summary,
        cat.signal,
        cat.track,
        ...cat.focus,
      ].join(' ').toLowerCase().includes(query);

      return matchesFilter && matchesQuery;
    });
  }, [categories, categoryFilter, categoryQuery]);

  const visibleCaseCount = visibleCategories.reduce((total, cat) => total + cat.count, 0);

  return (
    <div className="clinical-shell min-h-screen relative overflow-hidden">
      <div className="clinical-ambient fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 nav-blur border-b border-white/45 dark:border-white/10 safe-top">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Activity className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">
              Paramedic<span className="text-cyan-700 dark:text-cyan-300">Studio</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => document.getElementById('case-library')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/45 dark:hover:bg-white/10 transition-colors"
            >
              Library
            </button>
            <button
              onClick={() => onRoleSelect('student')}
              className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/45 dark:hover:bg-white/10 transition-colors"
            >
              Progress
            </button>
            {/* Guidelines opens the in-app clinical reference (drug + guideline
                library) via its dialog — the trigger is this nav button. */}
            <Suspense
              fallback={(
                <button className="px-3 py-1.5 text-xs font-medium text-muted-foreground rounded-lg" disabled>
                  Guidelines
                </button>
              )}
            >
              <ClinicalReferenceDialog
                trigger={(
                  <button className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/45 dark:hover:bg-white/10 transition-colors">
                    Guidelines
                  </button>
                )}
              />
            </Suspense>
            <div className="w-px h-4 bg-border/80 mx-1" />
            <button
              onClick={() => onRoleSelect('educator')}
              className="px-3 py-1.5 text-xs font-medium text-white btn-primary rounded-lg"
            >
              New Case
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-14">
            {/* Status badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-7 gentle-float">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-muted-foreground">{caseCount}+ clinical scenarios available</span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-5 leading-[1.1]">
              Master emergency<br />
              <span className="gradient-text">clinical decisions</span>
            </h1>
            
            <p className="text-base text-muted-foreground mb-8 leading-relaxed max-w-lg mx-auto">
              Generate realistic paramedic training scenarios. From cardiac arrests to multi-casualty incidents — every case builds your clinical reasoning through the ABCDE approach.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mb-10">
              <div className="text-center">
                <div className="text-3xl font-bold font-mono">
                  {caseCount}<span className="text-cyan-600 dark:text-cyan-300">+</span>
                </div>
                <div className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">
                  Scenarios
                </div>
              </div>
              <div className="w-px h-10 bg-border/80" />
              <div className="text-center">
                <div className="text-3xl font-bold font-mono">{categories.length}</div>
                <div className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">
                  Categories
                </div>
              </div>
              <div className="w-px h-10 bg-border/80" />
              <div className="text-center">
                <div className="text-3xl font-bold font-mono">{yearLevels.length}</div>
                <div className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">
                  Year Levels
                </div>
              </div>
            </div>
          </div>

          {/* Role Selection Cards */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Educator Card */}
              <button 
                onClick={() => onRoleSelect('educator')}
                className="glass-strong rounded-2xl p-6 card-premium text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-300/50 mb-4 group-hover:scale-105 transition-transform">
                  <Stethoscope className="w-6 h-6 text-cyan-700 dark:text-cyan-300" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Educator Panel</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate cases, set objectives, run simulations, and guide debriefing sessions
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <Badge variant="secondary" className="text-[10px]">Case generation</Badge>
                  <Badge variant="secondary" className="text-[10px]">Assessment checklist</Badge>
                </div>
                <div className="flex items-center gap-1 text-cyan-700 dark:text-cyan-300 text-sm font-medium">
                  Open Educator Panel <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Student Card */}
              <button 
                onClick={() => onRoleSelect('student')}
                className="glass-strong rounded-2xl p-6 card-premium text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-300/50 mb-4 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Student Training</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Work through real scenarios with live vitals, apply treatments, and get performance feedback
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <Badge variant="secondary" className="text-[10px]">Practice cases</Badge>
                  <Badge variant="secondary" className="text-[10px]">Performance feedback</Badge>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                  Start Training <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Classroom Host Card */}
              <button 
                onClick={() => onRoleSelect('classroom-host')}
                className="glass-strong rounded-2xl p-6 card-premium text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-300/50 mb-4 group-hover:scale-105 transition-transform">
                  <Monitor className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Classroom Host</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Host a live classroom session, broadcast cases to students, and control the simulation in real-time
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <Badge variant="secondary" className="text-[10px]">Live broadcast</Badge>
                  <Badge variant="secondary" className="text-[10px]">Student roster</Badge>
                </div>
                <div className="flex items-center gap-1 text-amber-600 text-sm font-medium">
                  Host Session <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Classroom Join Card */}
              <button 
                onClick={() => onRoleSelect('classroom-join')}
                className="glass-strong rounded-2xl p-6 card-premium text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-300/50 mb-4 group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6 text-sky-600" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Join Classroom</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Join an instructor-led session, receive live cases, and participate in group simulations
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <Badge variant="secondary" className="text-[10px]">Real-time sync</Badge>
                  <Badge variant="secondary" className="text-[10px]">Group chat</Badge>
                </div>
                <div className="flex items-center gap-1 text-sky-600 text-sm font-medium">
                  Join Session <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent max-w-6xl mx-auto" />

      {/* Categories Section — scroll target for the "Library" nav item */}
      <section id="case-library" className="py-14 sm:py-16 relative z-10 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-300 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Case library
              </div>
              <h2 className="text-2xl font-bold tracking-tight mb-1">Browse by clinical presentation</h2>
              <p className="text-sm text-muted-foreground max-w-xl">
                Search by presentation, decision point, or treatment focus before entering the simulator.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-white/60 bg-white/50 px-3 py-2 text-xs font-medium text-muted-foreground dark:border-white/10 dark:bg-white/[0.06]">
                <Timer className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-300" />
                {visibleCaseCount} cases shown
              </span>
              <button
                onClick={() => onRoleSelect('student')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200/70 bg-cyan-50/70 px-3 py-2 text-xs font-semibold text-cyan-800 transition-colors hover:bg-cyan-100 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200 dark:hover:bg-cyan-400/15"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="mb-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <label className="glass-control flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2">
              <Search className="w-4 h-4 text-cyan-700 dark:text-cyan-300 shrink-0" />
              <span className="sr-only">Search case library</span>
              <input
                value={categoryQuery}
                onChange={(event) => setCategoryQuery(event.target.value)}
                placeholder="Search cardiac, oxygen, GCS, defib..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filter
              </span>
              {categoryFilters.map((filter) => {
                const isActive = categoryFilter === filter.value;
                return (
                  <button
                    key={filter.value}
                    onClick={() => setCategoryFilter(filter.value)}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                      isActive
                        ? 'border-slate-900 bg-slate-950 text-white shadow-sm dark:border-cyan-300/40 dark:bg-cyan-300 dark:text-slate-950'
                        : 'glass-control text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {visibleCategories.map((cat) => {
              const Icon = cat.icon;
              const tone = categoryToneClass[cat.tone];
              return (
                <button
                  key={cat.slug}
                  onClick={() => onRoleSelect('student', cat.slug)}
                  aria-label={`Start ${cat.name} training cases`}
                  className="group relative min-h-[220px] overflow-hidden rounded-xl border border-white/60 bg-white/70 p-4 text-left shadow-[0_18px_45px_-34px_rgba(15,23,42,0.5)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200/80 hover:bg-white/82 hover:shadow-[0_24px_54px_-34px_rgba(15,23,42,0.62)] dark:border-white/10 dark:bg-white/[0.055] dark:hover:bg-white/[0.085]"
                >
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tone.accent}`} />
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${tone.icon}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="rounded-md bg-slate-900/90 px-2 py-1 text-[10px] font-semibold text-white dark:bg-white/90 dark:text-slate-950">
                        {cat.count} {cat.count === 1 ? 'case' : 'cases'}
                      </span>
                      <span className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${tone.chip}`}>
                        {cat.track}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-semibold tracking-tight mb-1">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed min-h-[2.25rem]">{cat.summary}</p>

                  <div className="mt-4 border-t border-slate-900/10 pt-3 dark:border-white/10">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      <ClipboardCheck className="w-3.5 h-3.5" />
                      Practice focus
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-foreground/80">
                      {cat.signal}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {cat.focus.map((item) => (
                      <span
                        key={item}
                        className="rounded-md border border-slate-900/10 bg-white/45 px-2 py-1 text-[10px] font-medium text-muted-foreground dark:border-white/10 dark:bg-white/[0.06]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-3 border-t border-slate-900/10 pt-3 dark:border-white/10">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-800 transition-colors group-hover:text-cyan-600 dark:text-cyan-200 dark:group-hover:text-cyan-100">
                      Start <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {visibleCategories.length === 0 && (
            <div className="glass mt-4 rounded-xl border p-5 text-center">
              <p className="text-sm font-semibold">No matching case track found</p>
              <p className="mt-1 text-xs text-muted-foreground">Try a different keyword or clear the active filter.</p>
              <button
                onClick={() => {
                  setCategoryQuery('');
                  setCategoryFilter('all');
                }}
                className="mt-3 rounded-lg border border-cyan-200/70 bg-cyan-50/70 px-3 py-2 text-xs font-semibold text-cyan-800 transition-colors hover:bg-cyan-100 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200"
              >
                Reset library
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 relative z-10 border-t border-white/45 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs text-muted-foreground">
            For educational purposes only | Evidence-based paramedic training
          </p>
        </div>
      </footer>
    </div>
  );
}
