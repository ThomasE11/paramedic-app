import { useState } from 'react';
import { 
  Activity, Stethoscope, Sparkles, ChevronDown, 
  HeartPulse, Bone, Wind, Brain, Baby, 
  HeartHandshake, Flame, FlaskConical, ArrowRight,
  BookOpen, BarChart3, Monitor, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LandingPageProps {
  onRoleSelect: (role: 'educator' | 'student' | 'classroom-host' | 'classroom-join') => void;
  caseCount: number;
}

const categories = [
  { name: 'Cardiac', count: 12, icon: HeartPulse, color: 'bg-red-50 border-red-100 text-red-500', difficulty: ['emerald', 'emerald', 'amber', 'gray'] },
  { name: 'Trauma', count: 10, icon: Bone, color: 'bg-orange-50 border-orange-100 text-orange-500', difficulty: ['emerald', 'amber', 'amber', 'red'] },
  { name: 'Respiratory', count: 4, icon: Wind, color: 'bg-sky-50 border-sky-100 text-sky-500', difficulty: ['emerald', 'emerald', 'amber', 'gray'] },
  { name: 'Neurological', count: 3, icon: Brain, color: 'bg-violet-50 border-violet-100 text-violet-500', difficulty: ['emerald', 'amber', 'amber', 'gray'] },
  { name: 'Pediatric', count: 1, icon: Baby, color: 'bg-pink-50 border-pink-100 text-pink-500', difficulty: ['amber', 'amber', 'red', 'red'] },
  { name: 'Obstetric', count: 1, icon: HeartHandshake, color: 'bg-rose-50 border-rose-100 text-rose-500', difficulty: ['amber', 'red', 'red', 'gray'] },
  { name: 'Burns', count: 1, icon: Flame, color: 'bg-amber-50 border-amber-100 text-amber-500', difficulty: ['emerald', 'amber', 'amber', 'gray'] },
  { name: 'Toxicology', count: 1, icon: FlaskConical, color: 'bg-emerald-50 border-emerald-100 text-emerald-500', difficulty: ['amber', 'amber', 'red', 'gray'] },
];

const yearLevels = [
  { value: '1st-year', label: 'Year 1', sublabel: 'Foundation Skills' },
  { value: '2nd-year', label: 'Year 2', sublabel: 'Developing Practitioner' },
  { value: '3rd-year', label: 'Year 3', sublabel: 'Advanced Practice' },
  { value: '4th-year', label: 'Year 4', sublabel: 'Specialist' },
];

export function LandingPage({ onRoleSelect, caseCount }: LandingPageProps) {
  const [selectedYear, setSelectedYear] = useState('3rd-year');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [includeECG, setIncludeECG] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-950 dark:to-gray-900 relative overflow-hidden">
      {/* Floating background orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-[80px] opacity-25 floating-orb"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,.12), rgba(124,58,237,.06))',
            top: '-200px',
            right: '-100px',
          }}
        />
        <div 
          className="absolute w-[500px] h-[500px] rounded-full blur-[80px] opacity-20 floating-orb-delayed"
          style={{
            background: 'linear-gradient(135deg, rgba(236,72,153,.08), rgba(139,92,246,.04))',
            bottom: '-150px',
            left: '-100px',
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-black/5">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Activity className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">
              Paramedic<span className="text-violet-600">Studio</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-black/5 transition-colors">
              Library
            </button>
            <button className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-black/5 transition-colors">
              Progress
            </button>
            <button className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-black/5 transition-colors">
              Guidelines
            </button>
            <div className="w-px h-4 bg-black/10 mx-1" />
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
              <span className="text-xs font-medium text-gray-600">{caseCount}+ clinical scenarios available</span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-5 leading-[1.1]">
              Master emergency<br />
              <span className="gradient-text">clinical decisions</span>
            </h1>
            
            <p className="text-base text-gray-500 mb-8 leading-relaxed max-w-lg mx-auto">
              Generate realistic paramedic training scenarios. From cardiac arrests to multi-casualty incidents — every case builds your clinical reasoning through the ABCDE approach.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mb-10">
              <div className="text-center">
                <div className="text-3xl font-bold font-mono">
                  {caseCount}<span className="text-violet-500">+</span>
                </div>
                <div className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wider">
                  Scenarios
                </div>
              </div>
              <div className="w-px h-10 bg-black/10" />
              <div className="text-center">
                <div className="text-3xl font-bold font-mono">18</div>
                <div className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wider">
                  Categories
                </div>
              </div>
              <div className="w-px h-10 bg-black/10" />
              <div className="text-center">
                <div className="text-3xl font-bold font-mono">4</div>
                <div className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wider">
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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-violet-50 flex items-center justify-center border border-violet-200/50 mb-4 group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-6 h-6 text-violet-600" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Educator Panel</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Generate cases, set objectives, run simulations, and guide debriefing sessions
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                  <Badge variant="secondary" className="text-[10px]">Case generation</Badge>
                  <Badge variant="secondary" className="text-[10px]">Assessment checklist</Badge>
                </div>
                <div className="flex items-center gap-1 text-violet-600 text-sm font-medium">
                  Open Educator Panel <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Student Card */}
              <button 
                onClick={() => onRoleSelect('student')}
                className="glass-strong rounded-2xl p-6 card-premium text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center border border-emerald-200/50 mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Student Training</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Work through real scenarios with live vitals, apply treatments, and get performance feedback
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center border border-amber-200/50 mb-4 group-hover:scale-110 transition-transform">
                  <Monitor className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Classroom Host</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Host a live classroom session, broadcast cases to students, and control the simulation in real-time
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-100 to-sky-50 flex items-center justify-center border border-sky-200/50 mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-sky-600" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Join Classroom</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Join an instructor-led session, receive live cases, and participate in group simulations
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                  <Badge variant="secondary" className="text-[10px]">Real-time sync</Badge>
                  <Badge variant="secondary" className="text-[10px]">Group chat</Badge>
                </div>
                <div className="flex items-center gap-1 text-sky-600 text-sm font-medium">
                  Join Session <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>

          {/* Quick Generator Card */}
          <div className="max-w-md mx-auto mb-16">
            <div className="glass-strong rounded-2xl p-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-violet-200/20 to-transparent rounded-full blur-3xl pointer-events-none" />
              <div className="bg-white/60 dark:bg-gray-900/60 rounded-xl p-6 sm:p-8 relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-violet-50 flex items-center justify-center border border-violet-200/50">
                    <Stethoscope className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Quick Case Generator</h3>
                    <p className="text-xs text-gray-400">Jump straight into a scenario</p>
                  </div>
                </div>

                {/* Year Level */}
                <div className="space-y-3 mb-5">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Student Year Level
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {yearLevels.map((year) => (
                        <button
                          key={year.value}
                          onClick={() => setSelectedYear(year.value)}
                          className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            selectedYear === year.value
                              ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20'
                              : 'bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-violet-300'
                          }`}
                        >
                          {year.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Category <span className="text-gray-300 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-800 dark:text-gray-200 appearance-none cursor-pointer input-premium text-sm font-medium"
                      >
                        <option value="all">Any category</option>
                        <option value="cardiac">Cardiac Emergency</option>
                        <option value="trauma">Trauma & Injury</option>
                        <option value="respiratory">Respiratory</option>
                        <option value="neurological">Neurological</option>
                        <option value="pediatric">Pediatric</option>
                        <option value="obstetric">Obstetric</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* ECG Toggle */}
                <div className="flex items-center gap-3 mb-5">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={includeECG}
                        onChange={(e) => setIncludeECG(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="w-4 h-4 rounded border-2 border-gray-300 peer-checked:bg-violet-500 peer-checked:border-violet-500 transition-all flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors">
                      Include ECG interpretation challenge
                    </span>
                  </label>
                </div>

                {/* Generate Button */}
                <Button 
                  onClick={() => onRoleSelect('student')}
                  className="w-full text-white font-semibold py-3 rounded-xl btn-primary flex items-center justify-center gap-2 group text-sm"
                >
                  <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                  Generate Training Case
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-black/5 to-transparent max-w-6xl mx-auto" />

      {/* Categories Section */}
      <section className="py-16 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold mb-1">Browse by Category</h2>
              <p className="text-xs text-gray-400">Explore cases organized by clinical presentation</p>
            </div>
            <button className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.name}
                  onClick={() => {
                    setSelectedCategory(cat.name.toLowerCase());
                    onRoleSelect('student');
                  }}
                  className="glass rounded-xl p-4 card-premium text-left"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${cat.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                      {cat.count}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold mb-0.5">{cat.name}</h3>
                  <p className="text-[10px] text-gray-400 mb-2">
                    {cat.name === 'Cardiac' && 'MI, arrhythmias, arrest'}
                    {cat.name === 'Trauma' && 'Blunt, penetrating, multi'}
                    {cat.name === 'Respiratory' && 'Asthma, COPD, pneumo'}
                    {cat.name === 'Neurological' && 'Stroke, seizure, LOC'}
                    {cat.name === 'Pediatric' && 'Age-specific emergencies'}
                    {cat.name === 'Obstetric' && 'Pregnancy complications'}
                    {cat.name === 'Burns' && 'Thermal, chemical, electrical'}
                    {cat.name === 'Toxicology' && 'Overdose, poisoning'}
                  </p>
                  <div className="flex items-center gap-1">
                    {cat.difficulty.map((color, i) => (
                      <span key={i} className={`w-1 h-1 rounded-full bg-${color}-400`} />
                    ))}
                    <span className="text-[9px] text-gray-400 ml-1">
                      {cat.difficulty.filter(c => c === 'red').length >= 2 ? 'Expert' : 
                       cat.difficulty.filter(c => c === 'amber').length >= 2 ? 'Advanced' : 'Mixed'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 relative z-10 border-t border-black/5">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs text-gray-400">
            For educational purposes only | Evidence-based paramedic training
          </p>
        </div>
      </footer>
    </div>
  );
}
