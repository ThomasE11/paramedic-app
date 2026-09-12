// Test-only host for the production hooks. It changes live input, not authored
// clinical data or the simulator state machine, to exercise deterioration.
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { allCases } from '@/data/cases';
import { usePatientVoice } from '@/hooks/usePatientVoice';
import { useVoiceNarration } from '@/hooks/useVoiceNarration';

function VoiceLifecycle() {
  const [gcs, setGcs] = useState(15);
  const patient = usePatientVoice(allCases.find(item => item.id === 'resp-001')!, { vitals: { gcs } });
  const narration = useVoiceNarration();
  const mouthOutput = useRef<HTMLOutputElement>(null);
  const mouth = patient.mouthOpenRef;
  useEffect(() => {
    let frame: number;
    const update = () => {
      if (mouthOutput.current) mouthOutput.current.value = mouth.current.toFixed(4);
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [mouth]);
  return <main>
    <h1>Patient voice lifecycle regression host</h1>
    <p>Live GCS: {gcs}</p>
    <p data-testid="communication">{patient.canVocalize ? 'Can answer' : 'Cannot answer'}</p>
    <p data-testid="playback">{narration.playbackRole ?? 'none'}: {narration.playbackStatus}</p>
    <output ref={mouthOutput} data-testid="mouth">0</output>
    <button onClick={() => patient.say('I cannot catch my breath.')}>Start patient</button>
    <button onClick={() => narration.speak('Dispatch information.', { role: 'dispatcher' })}>Start dispatcher</button>
    <button onClick={() => narration.speak('Observe the room.', { role: 'narrator' })}>Start narrator</button>
    <button onClick={() => setGcs(3)}>Reduce responsiveness</button>
    <button onClick={patient.stop}>Stop patient</button>
    <button onClick={narration.stop}>Stop all narration</button>
  </main>;
}

createRoot(document.getElementById('voice-test-root')!).render(<VoiceLifecycle />);
