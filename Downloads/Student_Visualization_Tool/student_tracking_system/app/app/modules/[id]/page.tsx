'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface SubmissionItem {
  type: string;
  number: number;
  title: string;
  description: string;
  mandatory: boolean;
  emoji: string;
}

interface TimelineEntry {
  date: string;
  time: string;
  items: SubmissionItem[];
}

interface ModuleData {
  id: string;
  code: string;
  name: string;
  description: string;
  submissionSchedule?: {
    requirements?: {
      casePresentation?: number;
      caseReflections?: number;
      pcrs?: number;
      logbookReviewPoints?: number;
      finalLogbook?: number;
    };
    timeline?: TimelineEntry[];
    criticalDeadlines?: Array<{ title: string; date: string }>;
  };
}

export default function ModuleDetailPage() {
  const params = useParams();
  const [module, setModule] = useState<ModuleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModule();
  }, [params.id]);

  const fetchModule = async () => {
    try {
      const response = await fetch(`/api/modules?id=${params.id}`);
      const data = await response.json();
      setModule(data);
    } catch (error) {
      console.error('Error fetching module:', error);
    } finally {
      setLoading(false);
    }
  };

  const isDeadlinePassed = (dateStr: string) => {
    const deadline = new Date(dateStr + 'T23:59:59');
    return deadline < new Date();
  };

  const isDeadlineUpcoming = (dateStr: string) => {
    const deadline = new Date(dateStr + 'T23:59:59');
    const now = new Date();
    const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil >= 0 && daysUntil <= 7;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-white rounded-lg shadow"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-800">Module not found</h1>
          <Link href="/modules" className="text-blue-600 hover:underline mt-4 inline-block">
            Back to Modules
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Link
          href="/modules"
          className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Modules
        </Link>

        {/* Module Info */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="border-l-4 border-blue-500 pl-6">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">{module.code}</h1>
            <h2 className="text-2xl text-slate-700 mb-4">{module.name}</h2>
            {module.description && (
              <p className="text-slate-600 leading-relaxed">{module.description}</p>
            )}
          </div>
        </div>

        {module.submissionSchedule && (
          <>
            {/* Requirements Overview */}
            {module.submissionSchedule.requirements && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-8 mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                  <CheckCircle2 className="w-7 h-7 mr-3 text-blue-600" />
                  Assignment Requirements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {module.submissionSchedule.requirements.casePresentation && (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-3xl font-bold text-blue-600">
                        {module.submissionSchedule.requirements.casePresentation}
                      </div>
                      <div className="text-slate-600 font-medium">Case Presentation</div>
                    </div>
                  )}
                  {module.submissionSchedule.requirements.caseReflections && (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-3xl font-bold text-blue-600">
                        {module.submissionSchedule.requirements.caseReflections}
                      </div>
                      <div className="text-slate-600 font-medium">Case Reflections</div>
                    </div>
                  )}
                  {module.submissionSchedule.requirements.pcrs && (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-3xl font-bold text-blue-600">
                        {module.submissionSchedule.requirements.pcrs}
                      </div>
                      <div className="text-slate-600 font-medium">
                        PCRs (Patient Care Reports)
                      </div>
                    </div>
                  )}
                  {module.submissionSchedule.requirements.logbookReviewPoints && (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-3xl font-bold text-blue-600">
                        {module.submissionSchedule.requirements.logbookReviewPoints}
                      </div>
                      <div className="text-slate-600 font-medium">
                        Logbook Review Points
                      </div>
                    </div>
                  )}
                  {module.submissionSchedule.requirements.finalLogbook && (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-3xl font-bold text-blue-600">
                        {module.submissionSchedule.requirements.finalLogbook}
                      </div>
                      <div className="text-slate-600 font-medium">Final Logbook</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Critical Deadlines */}
            {module.submissionSchedule.criticalDeadlines && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl shadow-lg p-8 mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                  <AlertCircle className="w-7 h-7 mr-3 text-red-600" />
                  Critical Deadlines Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {module.submissionSchedule.criticalDeadlines.map((deadline, index) => (
                    <div key={index} className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-red-500">
                      <div className="font-bold text-slate-800 mb-2">{deadline.title}</div>
                      <div className="text-2xl font-bold text-red-600">
                        {formatDate(deadline.date).split(',')[1]}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        {formatDate(deadline.date).split(',')[0]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submission Timeline */}
            {module.submissionSchedule.timeline && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center">
                  <Calendar className="w-7 h-7 mr-3 text-blue-600" />
                  Submission Timeline
                </h3>
                <div className="space-y-6">
                  {module.submissionSchedule.timeline.map((entry, index) => {
                    const isPassed = isDeadlinePassed(entry.date);
                    const isUpcoming = isDeadlineUpcoming(entry.date);

                    return (
                      <div
                        key={index}
                        className={`relative border-l-4 pl-8 pb-6 ${
                          isPassed
                            ? 'border-slate-300'
                            : isUpcoming
                            ? 'border-orange-400'
                            : 'border-blue-400'
                        }`}
                      >
                        {/* Timeline Dot */}
                        <div
                          className={`absolute left-0 top-0 w-4 h-4 rounded-full transform -translate-x-[10px] ${
                            isPassed
                              ? 'bg-slate-400'
                              : isUpcoming
                              ? 'bg-orange-400 ring-4 ring-orange-100'
                              : 'bg-blue-500 ring-4 ring-blue-100'
                          }`}
                        />

                        {/* Date Header */}
                        <div className="mb-4">
                          <div className="flex items-center gap-3 mb-1">
                            <Clock className={`w-5 h-5 ${isPassed ? 'text-slate-400' : 'text-blue-600'}`} />
                            <span className="text-lg font-bold text-slate-800">
                              {formatDate(entry.date)}
                            </span>
                            {isUpcoming && (
                              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                                UPCOMING
                              </span>
                            )}
                            {isPassed && (
                              <span className="px-3 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded-full">
                                PAST
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-slate-500 ml-8">
                            Due: {entry.time}
                          </div>
                        </div>

                        {/* Submission Items */}
                        <div className="space-y-3 ml-8">
                          {entry.items.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className={`p-5 rounded-lg border-2 transition-all ${
                                isPassed
                                  ? 'bg-slate-50 border-slate-200'
                                  : isUpcoming
                                  ? 'bg-orange-50 border-orange-200 shadow-md'
                                  : 'bg-blue-50 border-blue-200'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-3xl">{item.emoji}</span>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-bold text-slate-900">{item.title}</h4>
                                    {item.mandatory && (
                                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">
                                        MANDATORY
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-slate-600 text-sm leading-relaxed">
                                    {item.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* All Submissions Note */}
                <div className="mt-8 p-6 bg-slate-50 rounded-lg border-2 border-slate-200">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-slate-600" />
                    <div>
                      <div className="font-bold text-slate-800">All Submissions</div>
                      <div className="text-slate-600">Due by 11:59 PM on respective dates</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
