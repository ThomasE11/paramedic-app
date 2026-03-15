/**
 * Enhanced Vital Signs Monitor with Assessment Mode
 * 
 * Features:
 * - Show/hide individual vital signs
 * - Realistic assessment times for different vitals
 * - Equipment-based vital acquisition
 * - Assessment mode vs always-visible mode
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from "@/components/ui/progress";
import { 
  Activity, Heart, Wind as WindIcon, Droplets, Brain, 
  AlertTriangle, BellRing, Eye, EyeOff, Timer
} from 'lucide-react';
import type { VitalSigns } from '@/types';
import {
  applyDeterioration,
  getDeteriorationStatus,
  getReassessmentInterval,
  determineSeverity,
  type CaseSeverity,
} from '@/data/deteriorationSystem';

interface VitalSignsMonitorProps {
  initialVitals: VitalSigns;
  previousVitals?: VitalSigns | null;
  deteriorationVitals?: VitalSigns;
  onVitalChange?: (vitals: VitalSigns) => void;
  caseCategory?: string;
  appliedTreatments?: string[];
}

// Assessment method definitions
interface AssessmentMethod {
  id: string;
  name: string;
  description: string;
  duration: number; // seconds
  icon: string;
  equipment?: string[];
}

// Assessment methods for each vital sign
const ASSESSMENT_METHODS: Record<string, AssessmentMethod[]> = {
  bp: [
    { id: 'bp_manual', name: 'Manual BP Cuff', description: 'Palpate radial pulse, inflate cuff 20-30mmHg above loss', duration: 45, icon: 'Gauge', equipment: ['Sphygmomanometer', 'Stethoscope'] },
    { id: 'bp_auto', name: 'Auto BP Monitor', description: 'Digital automatic blood pressure monitor', duration: 15, icon: 'Activity', equipment: ['Auto BP Cuff'] },
    { id: 'bp_palpation', name: 'Palpation Only', description: 'Systolic only via palpation', duration: 20, icon: 'Hand', equipment: ['BP Cuff'] },
  ],
  pulse: [
    { id: 'pulse_radial', name: 'Radial Pulse', description: 'Palpate radial artery at wrist', duration: 10, icon: 'Hand' },
    { id: 'pulse_carotid', name: 'Carotid Pulse', description: 'Palpate carotid artery in neck', duration: 8, icon: 'Hand' },
    { id: 'pulse_monitor', name: 'Cardiac Monitor', description: 'ECG/Defibrillator monitor', duration: 3, icon: 'Activity', equipment: ['ECG Monitor'] },
    { id: 'pulse_pulseox', name: 'Pulse Oximeter', description: 'SpO2 probe with pulse detection', duration: 5, icon: 'ScanLine', equipment: ['Pulse Oximeter'] },
  ],
  respiration: [
    { id: 'resp_observation', name: 'Visual Observation', description: 'Observe chest rise and fall for 30 seconds', duration: 35, icon: 'Eye' },
    { id: 'resp_auscultation', name: 'Auscultation', description: 'Listen to breath sounds with stethoscope', duration: 25, icon: 'Stethoscope', equipment: ['Stethoscope'] },
    { id: 'resp_etco2', name: 'EtCO2 Capnography', description: 'End-tidal CO2 monitoring', duration: 5, icon: 'Gauge', equipment: ['Capnography'] },
  ],
  spo2: [
    { id: 'spo2_finger', name: 'Finger Probe', description: 'SpO2 probe on finger', duration: 8, icon: 'ScanLine', equipment: ['Pulse Oximeter'] },
    { id: 'spo2_ear', name: 'Ear Probe', description: 'SpO2 probe on earlobe', duration: 8, icon: 'ScanLine', equipment: ['Pulse Oximeter'] },
    { id: 'spo2_forehead', name: 'Forehead Sensor', description: 'Reflectance oximetry on forehead', duration: 10, icon: 'ScanLine', equipment: ['Forehead SpO2 Sensor'] },
  ],
  gcs: [
    { id: 'gcs_assessment', name: 'GCS Assessment', description: 'Full Glasgow Coma Scale assessment', duration: 60, icon: 'Brain' },
    { id: 'gcs_avpu', name: 'AVPU Quick', description: 'Alert, Voice, Pain, Unresponsive', duration: 15, icon: 'Activity' },
  ],
  temperature: [
    { id: 'temp_oral', name: 'Oral Thermometer', description: 'Digital oral thermometer', duration: 30, icon: 'Thermometer', equipment: ['Thermometer'] },
    { id: 'temp_tympanic', name: 'Tympanic', description: 'Ear thermometer', duration: 5, icon: 'Thermometer', equipment: ['Tympanic Thermometer'] },
    { id: 'temp_temporal', name: 'Temporal', description: 'Forehead temporal scanner', duration: 5, icon: 'Thermometer', equipment: ['Temporal Scanner'] },
    { id: 'temp_axillary', name: 'Axillary', description: 'Underarm thermometer', duration: 60, icon: 'Thermometer', equipment: ['Thermometer'] },
  ],
  glucose: [
    { id: 'glucose_meter', name: 'Glucometer', description: 'Finger stick blood glucose', duration: 20, icon: 'Droplet', equipment: ['Glucometer', 'Test Strips'] },
  ],
  etco2: [
    { id: 'etco2_nasal', name: 'Nasal Cannula', description: 'ETCO2 via nasal cannula adapter', duration: 10, icon: 'Gauge', equipment: ['Capnography', 'Nasal Cannula'] },
    { id: 'etco2_et', name: 'ET Tube Adapter', description: 'In-line ETCO2 for intubated patients', duration: 5, icon: 'Gauge', equipment: ['Capnography', 'ETCO2 Adapter'] },
  ],
  painScore: [
    { id: 'pain_scale', name: 'Pain Scale', description: 'Verbal or visual pain scale assessment', duration: 15, icon: 'Activity' },
  ],
};

// Vital sign configuration
interface VitalConfig {
  key: keyof VitalSigns;
  label: string;
  unit: string;
  icon: React.ReactNode;
  methods: AssessmentMethod[];
}

const VITAL_CONFIGS: VitalConfig[] = [
  { key: 'bp', label: 'Blood Pressure', unit: 'mmHg', icon: <Heart className="h-4 w-4" />, methods: ASSESSMENT_METHODS.bp },
  { key: 'pulse', label: 'Heart Rate', unit: 'bpm', icon: <Activity className="h-4 w-4" />, methods: ASSESSMENT_METHODS.pulse },
  { key: 'respiration', label: 'Respiratory Rate', unit: '/min', icon: <WindIcon className="h-4 w-4" />, methods: ASSESSMENT_METHODS.respiration },
  { key: 'spo2', label: 'SpO2', unit: '%', icon: <Droplets className="h-4 w-4" />, methods: ASSESSMENT_METHODS.spo2 },
  { key: 'gcs', label: 'GCS', unit: '/15', icon: <Brain className="h-4 w-4" />, methods: ASSESSMENT_METHODS.gcs },
  { key: 'temperature', label: 'Temperature', unit: '°C', icon: <Brain className="h-4 w-4" />, methods: ASSESSMENT_METHODS.temperature },
  { key: 'bloodGlucose', label: 'Glucose', unit: 'mmol/L', icon: <Activity className="h-4 w-4" />, methods: ASSESSMENT_METHODS.glucose },
  { key: 'etco2', label: 'EtCO2', unit: 'mmHg', icon: <WindIcon className="h-4 w-4" />, methods: ASSESSMENT_METHODS.etco2 },
  { key: 'painScore', label: 'Pain Score', unit: '/10', icon: <AlertTriangle className="h-4 w-4" />, methods: ASSESSMENT_METHODS.painScore },
];

// Alarm threshold definitions
interface AlarmThreshold {
  warningLow?: number;
  criticalLow?: number;
  warningHigh?: number;
  criticalHigh?: number;
}

const ALARM_THRESHOLDS: Record<string, AlarmThreshold> = {
  pulse: { warningLow: 50, criticalLow: 40, warningHigh: 100, criticalHigh: 120 },
  spo2: { warningLow: 95, criticalLow: 90, warningHigh: 100 },
  respiration: { warningLow: 10, criticalLow: 8, warningHigh: 24, criticalHigh: 30 },
  systolic: { warningLow: 90, criticalLow: 80, warningHigh: 140, criticalHigh: 180 },
  diastolic: { warningLow: 60, criticalLow: 50, warningHigh: 90, criticalHigh: 110 },
  gcs: { warningLow: 14, criticalLow: 9 },
  temperature: { warningLow: 36, criticalLow: 35, warningHigh: 37.5, criticalHigh: 39 },
  bloodGlucose: { warningLow: 3.5, criticalLow: 2.5, warningHigh: 15, criticalHigh: 25 },
};

// Check if value triggers alarm
function checkAlarm(value: number, thresholds: AlarmThreshold): { isWarning: boolean; isCritical: boolean } {
  if (thresholds.criticalLow !== undefined && value <= thresholds.criticalLow) {
    return { isWarning: false, isCritical: true };
  }
  if (thresholds.criticalHigh !== undefined && value >= thresholds.criticalHigh) {
    return { isWarning: false, isCritical: true };
  }
  if (thresholds.warningLow !== undefined && value <= thresholds.warningLow) {
    return { isWarning: true, isCritical: false };
  }
  if (thresholds.warningHigh !== undefined && value >= thresholds.warningHigh) {
    return { isWarning: true, isCritical: false };
  }
  return { isWarning: false, isCritical: false };
}

// Hidden vital sign placeholder component
function HiddenVitalCard({ 
  label, 
  icon, 
  onAssess, 
  isAssessing,
  progress 
}: { 
  label: string; 
  icon: React.ReactNode; 
  onAssess: () => void;
  isAssessing: boolean;
  progress: number;
}) {
  return (
    <div 
      onClick={!isAssessing ? onAssess : undefined}
      className={`relative p-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 min-h-[100px] flex flex-col justify-between cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-all ${isAssessing ? 'cursor-wait' : ''}`}
    >
      <div className="flex items-center gap-2 mb-2 text-gray-400">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      
      {isAssessing ? (
        <div className="space-y-2">
          <div className="text-2xl font-bold text-gray-400">???</div>
          <Progress value={progress} className="h-1" />
          <div className="text-[10px] text-gray-400">Assessing...</div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1">
          <EyeOff className="h-8 w-8 text-gray-300 mb-1" />
          <span className="text-[10px] text-gray-400">Click to assess</span>
        </div>
      )}
    </div>
  );
}

// Visible vital metric component
function VitalMetric({
  label,
  value,
  unit,
  icon,
  status,
  onHide,
  alarmActive,
  previousValue
}: {
  label: string;
  value: string | number;
  unit: string;
  icon: React.ReactNode;
  status: 'normal' | 'warning' | 'critical';
  onHide: () => void;
  alarmActive: boolean;
  previousValue?: string | number;
}) {
  const statusColors = {
    normal: 'text-green-600 bg-green-50 border-green-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    critical: 'text-red-600 bg-red-50 border-red-200 animate-pulse'
  };

  const hasChanged = previousValue !== undefined && previousValue !== value;

  return (
    <div className={`relative p-4 rounded-lg border-2 transition-all duration-300 min-h-[100px] flex flex-col justify-between ${statusColors[status]} ${alarmActive ? 'ring-4 ring-red-500 ring-opacity-50' : ''} ${hasChanged ? 'scale-105 shadow-lg' : ''}`}>
      <button
        onClick={onHide}
        className="absolute top-1 right-1 p-1 rounded hover:bg-white/50 text-gray-400 hover:text-gray-600"
        title="Hide vital sign"
      >
        <EyeOff className="h-3 w-3" />
      </button>

      {alarmActive && (
        <div className="absolute -top-2 -right-2">
          <BellRing className="h-5 w-5 text-red-500 animate-bounce" />
        </div>
      )}

      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium opacity-70 truncate">{label}</span>
        {alarmActive && <AlertTriangle className="h-3 w-3 text-red-500 animate-pulse" />}
      </div>

      <div className="flex items-baseline gap-1 flex-wrap">
        <span className={`text-2xl font-bold break-all ${alarmActive ? 'text-red-600' : ''} ${hasChanged ? 'animate-pulse' : ''}`}>
          {value}
        </span>
        <span className="text-xs opacity-60 whitespace-nowrap">{unit}</span>
      </div>

      {hasChanged && (
        <div className="text-[10px] opacity-70 mt-1">
          Was: {previousValue} {unit}
        </div>
      )}
    </div>
  );
}

export function VitalSignsMonitor({
  initialVitals,
  previousVitals,
  deteriorationVitals,
  onVitalChange,
  caseCategory,
  appliedTreatments = [],
}: VitalSignsMonitorProps) {
  const [currentVitals, setCurrentVitals] = useState<VitalSigns>(initialVitals);
  
  // Visibility state for each vital sign
  const [visibleVitals, setVisibleVitals] = useState<Set<string>>(new Set());
  const [assessmentMode, setAssessmentMode] = useState(true); // Start in assessment mode
  
  // Active assessments
  const [activeAssessments, setActiveAssessments] = useState<Map<string, { startTime: number; duration: number }>>(new Map());
  const [assessmentProgress, setAssessmentProgress] = useState<Map<string, number>>(new Map());
  
  // Alarms
  const [alarmsEnabled, setAlarmsEnabled] = useState(true);
  const [activeAlarms, setActiveAlarms] = useState<Set<string>>(new Set());
  
  // Deterioration state
  const [caseSeverity, setCaseSeverity] = useState<CaseSeverity>(() => 
    determineSeverity(caseCategory || 'general', initialVitals)
  );
  const [minutesElapsed, setMinutesElapsed] = useState(0);
  const [deteriorationWarningSigns, setDeteriorationWarningSigns] = useState<string[]>([]);
  const [deteriorationChanges, setDeteriorationChanges] = useState<string[]>([]);
  const [isDeteriorationCritical, setIsDeteriorationCritical] = useState(false);
  // Use appliedTreatments prop for deterioration calculations
  const activeTreatments = appliedTreatments;
  
  // Selected assessment methods
  const [selectedMethods, setSelectedMethods] = useState<Record<string, string>>({});
   
  // Animation refs
  const assessmentIntervalRef = useRef<number | null>(null);
  const deteriorationTimerRef = useRef<number | null>(null);

  // Filter available vitals based on what's in currentVitals
  const availableVitals = useMemo(() => {
    return VITAL_CONFIGS.filter(config => {
      const value = currentVitals[config.key];
      return value !== undefined && value !== null;
    });
  }, [currentVitals]);

  // Calculate alarms
  useEffect(() => {
    const newAlarms = new Set<string>();
    
    const pulse = parseInt(String(currentVitals.pulse)) || 80;
    const spo2 = currentVitals.spo2 || 98;
    const respiration = currentVitals.respiration || 16;
    const gcs = currentVitals.gcs || 15;
    const bpParts = String(currentVitals.bp || '120/80').split('/');
    const systolic = parseInt(bpParts[0]) || 120;
    const temp = currentVitals.temperature || 36.5;
    const glucose = currentVitals.bloodGlucose || 5.5;
    
    if (checkAlarm(pulse, ALARM_THRESHOLDS.pulse).isCritical) newAlarms.add('pulse-critical');
    else if (checkAlarm(pulse, ALARM_THRESHOLDS.pulse).isWarning) newAlarms.add('pulse-warning');
    
    if (checkAlarm(spo2, ALARM_THRESHOLDS.spo2).isCritical) newAlarms.add('spo2-critical');
    else if (checkAlarm(spo2, ALARM_THRESHOLDS.spo2).isWarning) newAlarms.add('spo2-warning');
    
    if (checkAlarm(respiration, ALARM_THRESHOLDS.respiration).isCritical) newAlarms.add('respiration-critical');
    else if (checkAlarm(respiration, ALARM_THRESHOLDS.respiration).isWarning) newAlarms.add('respiration-warning');
    
    if (checkAlarm(systolic, ALARM_THRESHOLDS.systolic).isCritical) newAlarms.add('bp-critical');
    else if (checkAlarm(systolic, ALARM_THRESHOLDS.systolic).isWarning) newAlarms.add('bp-warning');
    
    if (checkAlarm(gcs, ALARM_THRESHOLDS.gcs).isCritical) newAlarms.add('gcs-critical');
    else if (checkAlarm(gcs, ALARM_THRESHOLDS.gcs).isWarning) newAlarms.add('gcs-warning');
    
    if (checkAlarm(temp, ALARM_THRESHOLDS.temperature).isCritical) newAlarms.add('temp-critical');
    else if (checkAlarm(temp, ALARM_THRESHOLDS.temperature).isWarning) newAlarms.add('temp-warning');
    
    if (checkAlarm(glucose, ALARM_THRESHOLDS.bloodGlucose).isCritical) newAlarms.add('glucose-critical');
    else if (checkAlarm(glucose, ALARM_THRESHOLDS.bloodGlucose).isWarning) newAlarms.add('glucose-warning');
    
    setActiveAlarms(newAlarms);
  }, [currentVitals]);

  // Deterioration timer - applies deterioration every minute
  useEffect(() => {
    deteriorationTimerRef.current = window.setInterval(() => {
      setMinutesElapsed(prev => {
        const newMinutes = prev + 1;
        
        // Apply deterioration
        const result = applyDeterioration(
          currentVitals,
          caseSeverity,
          1, // 1 minute elapsed
          activeTreatments
        );
        
        // Update vitals
        setCurrentVitals(result.newVitals);
        setDeteriorationWarningSigns(result.warningSigns);
        setDeteriorationChanges(result.changes);
        setIsDeteriorationCritical(result.isCritical);
        
        // Notify parent of vital changes
        if (onVitalChange) {
          onVitalChange(result.newVitals);
        }
        
        return newMinutes;
      });
    }, 60000); // Every minute (60000ms)
    
    return () => {
      if (deteriorationTimerRef.current) {
        clearInterval(deteriorationTimerRef.current);
      }
    };
  }, [currentVitals, caseSeverity, activeTreatments, onVitalChange]);

  // Assessment progress animation
  useEffect(() => {
    if (activeAssessments.size === 0) return;
    
    const updateProgress = () => {
      const now = Date.now();
      const newProgress = new Map<string, number>();
      const completed: string[] = [];
      
      activeAssessments.forEach((assessment, vitalKey) => {
        const elapsed = (now - assessment.startTime) / 1000;
        const progress = Math.min(100, (elapsed / assessment.duration) * 100);
        newProgress.set(vitalKey, progress);
        
        if (progress >= 100) {
          completed.push(vitalKey);
        }
      });
      
      setAssessmentProgress(newProgress);
      
      // Complete assessments
      if (completed.length > 0) {
        setVisibleVitals(prev => {
          const next = new Set(prev);
          completed.forEach(key => next.add(key));
          return next;
        });
        
        setActiveAssessments(prev => {
          const next = new Map(prev);
          completed.forEach(key => next.delete(key));
          return next;
        });
      }
      
      if (activeAssessments.size > 0) {
        assessmentIntervalRef.current = requestAnimationFrame(updateProgress);
      }
    };
    
    assessmentIntervalRef.current = requestAnimationFrame(updateProgress);
    
    return () => {
      if (assessmentIntervalRef.current) {
        cancelAnimationFrame(assessmentIntervalRef.current);
      }
    };
  }, [activeAssessments]);

  // Start assessment of a vital sign
  const startAssessment = (vitalKey: string, method: AssessmentMethod) => {
    if (activeAssessments.has(vitalKey) || visibleVitals.has(vitalKey)) return;
    
    setActiveAssessments(prev => {
      const next = new Map(prev);
      next.set(vitalKey, { startTime: Date.now(), duration: method.duration });
      return next;
    });
    
    setSelectedMethods(prev => ({ ...prev, [vitalKey]: method.id }));
  };

  // Hide a vital sign
  const hideVital = (vitalKey: string) => {
    setVisibleVitals(prev => {
      const next = new Set(prev);
      next.delete(vitalKey);
      return next;
    });
  };

  // Show all vitals (disable assessment mode)
  const showAllVitals = () => {
    setVisibleVitals(new Set(availableVitals.map(v => v.key)));
    setAssessmentMode(false);
  };

  // Hide all vitals (enable assessment mode)
  const hideAllVitals = () => {
    setVisibleVitals(new Set());
    setAssessmentMode(true);
  };

  // Get status for a vital
  const getVitalStatus = (key: string, value: number | string): 'normal' | 'warning' | 'critical' => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    
    switch (key) {
      case 'pulse':
        return checkAlarm(numValue, ALARM_THRESHOLDS.pulse).isCritical ? 'critical' : 
               checkAlarm(numValue, ALARM_THRESHOLDS.pulse).isWarning ? 'warning' : 'normal';
      case 'spo2':
        return checkAlarm(numValue, ALARM_THRESHOLDS.spo2).isCritical ? 'critical' : 
               checkAlarm(numValue, ALARM_THRESHOLDS.spo2).isWarning ? 'warning' : 'normal';
      case 'respiration':
        return checkAlarm(numValue, ALARM_THRESHOLDS.respiration).isCritical ? 'critical' : 
               checkAlarm(numValue, ALARM_THRESHOLDS.respiration).isWarning ? 'warning' : 'normal';
      case 'bp':
        const systolic = parseInt(String(value).split('/')[0]) || 120;
        return checkAlarm(systolic, ALARM_THRESHOLDS.systolic).isCritical ? 'critical' : 
               checkAlarm(systolic, ALARM_THRESHOLDS.systolic).isWarning ? 'warning' : 'normal';
      case 'gcs':
        return checkAlarm(numValue, ALARM_THRESHOLDS.gcs).isCritical ? 'critical' : 
               checkAlarm(numValue, ALARM_THRESHOLDS.gcs).isWarning ? 'warning' : 'normal';
      case 'temperature':
        return checkAlarm(numValue, ALARM_THRESHOLDS.temperature).isCritical ? 'critical' : 
               checkAlarm(numValue, ALARM_THRESHOLDS.temperature).isWarning ? 'warning' : 'normal';
      default:
        return 'normal';
    }
  };

  // Check if vital has alarm
  const hasAlarm = (key: string): boolean => {
    return Array.from(activeAlarms).some(alarm => alarm.startsWith(key));
  };

  const alarmStatus = {
    hasCritical: Array.from(activeAlarms).some(a => a.includes('critical')),
    hasWarning: Array.from(activeAlarms).some(a => a.includes('warning')),
    count: activeAlarms.size,
  };

  // Note: Treatments are managed by parent component via appliedTreatments prop
  // This component uses them to calculate deterioration slowdown

  return (
    <Card className={`border-2 ${alarmStatus.hasCritical ? 'border-red-500' : alarmStatus.hasWarning ? 'border-yellow-500' : 'border-primary/20'}`}>
      <CardHeader className="pb-2 px-3 sm:px-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Vital Signs Monitor
            </CardTitle>
            <div className="flex items-center gap-1.5">
              {assessmentMode && (
                <Badge variant="secondary" className="text-[10px]">
                  <EyeOff className="h-3 w-3 mr-1" />
                  Assessment Mode
                </Badge>
              )}
              {alarmStatus.count > 0 && alarmsEnabled && (
                <Badge className={`text-[10px] ${alarmStatus.hasCritical ? 'bg-red-500' : 'bg-yellow-500'}`}>
                  <BellRing className="h-3 w-3 mr-1" />
                  {alarmStatus.count}
                </Badge>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={assessmentMode ? showAllVitals : hideAllVitals}
            className="h-7 sm:h-8 text-[10px] sm:text-xs shrink-0"
          >
            {assessmentMode ? (
              <><Eye className="h-3 w-3 mr-1" /> Show All</>
            ) : (
              <><EyeOff className="h-3 w-3 mr-1" /> Hide All</>
            )}
          </Button>
        </div>
        
        {assessmentMode && (
          <p className="text-xs text-muted-foreground mt-1">
            Click on hidden vitals to assess them. Different methods have different assessment times.
          </p>
        )}
      </CardHeader>
      
      <CardContent>
        {/* Alarm Banner */}
        {alarmStatus.count > 0 && alarmsEnabled && (
          <div className={`mb-4 p-3 border-2 rounded-lg ${alarmStatus.hasCritical ? 'bg-red-100 border-red-500' : 'bg-yellow-100 border-yellow-500'}`}>
            <div className="flex items-center gap-2">
              <BellRing className={`h-5 w-5 ${alarmStatus.hasCritical ? 'text-red-600' : 'text-yellow-600'} animate-bounce`} />
              <span className={`font-bold ${alarmStatus.hasCritical ? 'text-red-800' : 'text-yellow-800'}`}>
                {alarmStatus.count} Alarm{alarmStatus.count > 1 ? 's' : ''} Active
              </span>
            </div>
          </div>
        )}
        
        {/* Deterioration Status Banner */}
        {(() => {
          const status = getDeteriorationStatus(caseSeverity, minutesElapsed);
          const reassessmentInterval = getReassessmentInterval(caseSeverity);
          
          if (status.urgency === 'low' && minutesElapsed < 2) return null;
          
          const urgencyColors = {
            low: 'bg-green-50 border-green-200 text-green-800',
            medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
            high: 'bg-orange-50 border-orange-200 text-orange-800',
            extreme: 'bg-red-50 border-red-500 text-red-800 animate-pulse'
          };
          
          return (
            <div className={`mb-4 p-3 border-2 rounded-lg ${urgencyColors[status.urgency]}`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  <span className="font-bold">
                    Deterioration: {status.status.toUpperCase()}
                  </span>
                  {activeTreatments.length > 0 && (
                    <Badge variant="outline" className="text-[10px]">
                      Slowed by treatment
                    </Badge>
                  )}
                </div>
                <div className="text-xs">
                  Reassess every {reassessmentInterval} min
                </div>
              </div>
              
              {status.percentDeteriorated > 20 && (
                <div className="mt-2">
                  <Progress value={status.percentDeteriorated} className="h-2" />
                  <div className="flex justify-between text-[10px] mt-1">
                    <span>Progress: {Math.round(status.percentDeteriorated)}%</span>
                    <span>Time remaining: ~{status.timeRemaining} min</span>
                  </div>
                </div>
              )}
              
              {deteriorationWarningSigns.length > 0 && (
                <div className="mt-2 text-xs">
                  <span className="font-medium">Warning signs:</span>
                  <ul className="mt-1 space-y-0.5">
                    {deteriorationWarningSigns.map((sign, idx) => (
                      <li key={idx} className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {sign}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {deteriorationChanges.length > 0 && (
                <div className="mt-2 text-xs">
                  <span className="font-medium">Recent changes:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {deteriorationChanges.slice(-3).map((change, idx) => (
                      <Badge key={idx} variant="secondary" className="text-[10px]">
                        {change}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
        
        {/* Vitals Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {availableVitals.map((config) => {
            const isVisible = visibleVitals.has(config.key);
            const isAssessing = activeAssessments.has(config.key);
            const progress = assessmentProgress.get(config.key) || 0;
            const value = currentVitals[config.key];
            
            if (!isVisible) {
              // Show method selection or hidden card
              if (isAssessing) {
                return (
                  <div key={config.key} className="p-3 rounded-lg border-2 border-blue-200 bg-blue-50">
                    <div className="text-xs font-medium text-blue-700 mb-1">{config.label}</div>
                    <div className="text-2xl font-bold text-blue-400">???</div>
                    <Progress value={progress} className="h-1 mt-2" />
                    <div className="text-[10px] text-blue-600 mt-1">{Math.round(progress)}%</div>
                  </div>
                );
              }
              
              // Show method selection
              return (
                <div key={config.key} className="p-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                  <div className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                    {config.icon}
                    {config.label}
                  </div>
                  <div className="space-y-1">
                    {config.methods.slice(0, 2).map((method) => (
                      <button
                        key={method.id}
                        onClick={() => startAssessment(config.key, method)}
                        className="w-full text-left text-[10px] p-1.5 rounded bg-white border hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      >
                        <div className="font-medium">{method.name}</div>
                        <div className="text-gray-400">{method.duration}s</div>
                      </button>
                    ))}
                    {config.methods.length > 2 && (
                      <div className="text-[10px] text-gray-400 text-center">
                        +{config.methods.length - 2} more methods
                      </div>
                    )}
                  </div>
                </div>
              );
            }
            
            // Show visible vital
            const previousValue = previousVitals ? previousVitals[config.key] : undefined;
            return (
              <VitalMetric
                key={config.key}
                label={config.label}
                value={String(value)}
                unit={config.unit}
                icon={config.icon}
                status={getVitalStatus(config.key, value as number | string)}
                onHide={() => hideVital(config.key)}
                alarmActive={hasAlarm(config.key)}
                previousValue={previousValue !== undefined ? String(previousValue) : undefined}
              />
            );
          })}
        </div>
        
        {/* Active Assessments Summary */}
        {activeAssessments.size > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <Timer className="h-4 w-4" />
              <span className="font-medium">{activeAssessments.size} Assessment{activeAssessments.size > 1 ? 's' : ''} in Progress</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default VitalSignsMonitor;
