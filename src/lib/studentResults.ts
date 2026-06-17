/**
 * studentResults — persist graded case results for signed-in students.
 *
 * Saves the deterministic SmartGrade (plus headline score, adverse-event
 * summary, and case metadata) to `public.student_results` so progress carries
 * across sessions and devices. No-ops gracefully when Supabase isn't
 * configured or the user isn't signed in (anonymous PIN play still works).
 */

import { useCallback, useEffect, useState } from 'react';
import { getSupabaseClient } from './supabase';
import type { SmartGrade } from '@/data/smartGrader';

export interface StudentResultInput {
  studentId: string;
  studentName?: string;
  sessionId?: string | null;
  caseId?: string;
  caseTitle?: string;
  category?: string;
  studentYear?: string;
  score: number;
  grade: SmartGrade;
  adverseEvents?: unknown;
}

export interface StudentResultRow {
  id: string;
  case_title: string | null;
  category: string | null;
  score: number | null;
  band: string | null;
  created_at: string;
}

/**
 * Insert one graded result. Best-effort: returns the new row id or null and
 * never throws (a failed save must not break the debrief).
 */
export async function saveStudentResult(input: StudentResultInput): Promise<string | null> {
  const supa = getSupabaseClient();
  if (!supa || !input.studentId) return null;
  try {
    const { data, error } = await supa
      .from('student_results')
      .insert({
        student_id: input.studentId,
        student_name: input.studentName ?? null,
        session_id: input.sessionId ?? null,
        case_id: input.caseId ?? null,
        case_title: input.caseTitle ?? null,
        category: input.category ?? null,
        student_year: input.studentYear ?? null,
        score: input.score,
        band: input.grade.band.label,
        dimensions: input.grade.dimensions,
        adverse_events: input.adverseEvents ?? null,
      })
      .select('id')
      .single();
    if (error) {
      console.warn('[results] save failed', error.message);
      return null;
    }
    return (data as { id: string }).id;
  } catch (e) {
    console.warn('[results] save threw', e);
    return null;
  }
}

/** Load the signed-in student's recent results (newest first). */
export function useMyResults(studentId: string | null): {
  results: StudentResultRow[];
  loading: boolean;
  refresh: () => void;
} {
  const [results, setResults] = useState<StudentResultRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [nonce, setNonce] = useState(0);
  const refresh = useCallback(() => setNonce(n => n + 1), []);

  useEffect(() => {
    const supa = getSupabaseClient();
    if (!supa || !studentId) {
      setResults([]);
      return;
    }
    let active = true;
    setLoading(true);
    supa
      .from('student_results')
      .select('id, case_title, category, score, band, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) console.warn('[results] load failed', error.message);
        setResults((data as StudentResultRow[] | null) ?? []);
        setLoading(false);
      });
    return () => { active = false; };
  }, [studentId, nonce]);

  return { results, loading, refresh };
}
