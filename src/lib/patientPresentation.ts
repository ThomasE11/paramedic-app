/**
 * Maps a case's found-position text to how the 3D patient should be presented.
 * @param positionText - The text describing the patient's position.
 * @returns The posture and surface for the 3D patient presentation.
 */
export type Posture = 'upright' | 'supine';
export type Surface = 'none' | 'floor' | 'bed';
export interface PatientPresentation { posture: Posture; surface: Surface }

export function patientPresentationFor(positionText: string | undefined): PatientPresentation {
  if (!positionText || positionText.trim() === '') return { posture: 'upright', surface: 'none' };
  const lowerCaseText = positionText.toLowerCase();
  if (lowerCaseText.includes('various')) return { posture: 'upright', surface: 'none' };
  if (lowerCaseText.includes('supine') || lowerCaseText.includes('lying')) {
    return lowerCaseText.includes('bed') || lowerCaseText.includes('bunk')
      ? { posture: 'supine', surface: 'bed' }
      : { posture: 'supine', surface: 'floor' };
  }
  return { posture: 'upright', surface: 'none' };
}
