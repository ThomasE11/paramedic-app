'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { SignaturePad } from '../SignaturePad';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { generateRecordOfDiscussionPDF, downloadPDF } from '@/lib/pdf-generator';
import toast from 'react-hot-toast';

interface RecordOfDiscussionFormProps {
  studentId: string;
  student: {
    studentId: string;
    fullName: string;
    email: string;
    phone: string;
  };
  onSave?: (data: any) => void;
  initialData?: any;
}

export function RecordOfDiscussionForm({
  studentId,
  student,
  onSave,
  initialData
}: RecordOfDiscussionFormProps) {
  const [conductorSignature, setConductorSignature] = useState<string>(initialData?.conductorSignature || '');
  const [studentSignature, setStudentSignature] = useState<string>(initialData?.studentSignature || '');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      discussionDate: initialData?.discussionDate ? new Date(initialData.discussionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      discussionTime: initialData?.discussionTime || '08:30',
      companyNameLocation: initialData?.companyNameLocation || 'SSMC',
      conductorName: initialData?.conductorName || '',
      conductorRole: initialData?.conductorRole || 'HCT Mentor',
      peoplePresent: initialData?.peoplePresent || '',
      discussedTopics: initialData?.discussedTopics || '',
      studentActions: initialData?.studentActions || '',
      evidenceAvailable: initialData?.evidenceAvailable || '',
      followUpAttendance: initialData?.followUpAttendance || '',
      attendanceRecorded: initialData?.attendanceRecorded || false,
      attendanceSessions: initialData?.attendanceSessions || 3,
      challengesEncountered: initialData?.challengesEncountered || 'Student reported no challenges encountered so far.',
      interestingCases: initialData?.interestingCases || '',
      sa2Discussion: initialData?.sa2Discussion || 'Reviewed requirements for the upcoming PP presentation and video submission: hand over',
      assessmentCriteriaMet: initialData?.assessmentCriteriaMet || '',
      // Skills checkboxes
      bloodPressure: initialData?.skillsCompleted?.bloodPressure || false,
      temperature: initialData?.skillsCompleted?.temperature || false,
      respiratoryRate: initialData?.skillsCompleted?.respiratoryRate || false,
      heartRate: initialData?.skillsCompleted?.heartRate || false,
      woundCare: initialData?.skillsCompleted?.woundCare || false,
      sutures: initialData?.skillsCompleted?.sutures || false,
      ecg: initialData?.skillsCompleted?.ecg || false,
      nasalThroatSwabs: initialData?.skillsCompleted?.nasalThroatSwabs || false,
      xrayObservation: initialData?.skillsCompleted?.xrayObservation || false,
      lucasMechanicalDevice: initialData?.skillsCompleted?.lucasMechanicalDevice || false,
      hgtRecording: initialData?.skillsCompleted?.hgtRecording || false,
      arterialBloodGases: initialData?.skillsCompleted?.arterialBloodGases || false,
      theatreDislocationLateralMalleolus: initialData?.skillsCompleted?.theatreDislocationLateralMalleolus || false,
      imInjection: initialData?.skillsCompleted?.imInjection || false,
      bandaging: initialData?.skillsCompleted?.bandaging || false,
      communicationTranslation: initialData?.skillsCompleted?.communicationTranslation || false,
    }
  });

  const watchedValues = watch();

  const onSubmit = async (data: any) => {
    setIsSaving(true);
    try {
      const skillsCompleted = {
        bloodPressure: data.bloodPressure,
        temperature: data.temperature,
        respiratoryRate: data.respiratoryRate,
        heartRate: data.heartRate,
        woundCare: data.woundCare,
        sutures: data.sutures,
        ecg: data.ecg,
        nasalThroatSwabs: data.nasalThroatSwabs,
        xrayObservation: data.xrayObservation,
        lucasMechanicalDevice: data.lucasMechanicalDevice,
        hgtRecording: data.hgtRecording,
        arterialBloodGases: data.arterialBloodGases,
        theatreDislocationLateralMalleolus: data.theatreDislocationLateralMalleolus,
        imInjection: data.imInjection,
        bandaging: data.bandaging,
        communicationTranslation: data.communicationTranslation,
      };

      const payload = {
        studentId,
        discussionDate: data.discussionDate,
        discussionTime: data.discussionTime,
        companyNameLocation: data.companyNameLocation,
        conductorName: data.conductorName,
        conductorRole: data.conductorRole,
        peoplePresent: data.peoplePresent,
        discussedTopics: data.discussedTopics,
        studentActions: data.studentActions,
        evidenceAvailable: data.evidenceAvailable,
        followUpAttendance: data.followUpAttendance,
        attendanceRecorded: data.attendanceRecorded,
        attendanceSessions: data.attendanceSessions,
        challengesEncountered: data.challengesEncountered,
        interestingCases: data.interestingCases,
        skillsCompleted,
        sa2Discussion: data.sa2Discussion,
        assessmentCriteriaMet: data.assessmentCriteriaMet,
        conductorSignature,
        conductorSignatureDate: conductorSignature ? new Date().toISOString() : null,
        studentSignature,
        studentSignatureDate: studentSignature ? new Date().toISOString() : null,
        createdBy: 'current-user', // Replace with actual user ID from session
      };

      const method = initialData?.id ? 'PUT' : 'POST';
      const url = '/api/record-of-discussion';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initialData?.id ? { id: initialData.id, ...payload } : payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save record');
      }

      const savedRecord = await response.json();
      toast.success('Record saved successfully!');

      if (onSave) {
        onSave(savedRecord);
      }
    } catch (error) {
      console.error('Error saving record:', error);
      toast.error('Failed to save record');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const data = watchedValues;
      const skillsCompleted = {
        bloodPressure: data.bloodPressure,
        temperature: data.temperature,
        respiratoryRate: data.respiratoryRate,
        heartRate: data.heartRate,
        woundCare: data.woundCare,
        sutures: data.sutures,
        ecg: data.ecg,
        nasalThroatSwabs: data.nasalThroatSwabs,
        xrayObservation: data.xrayObservation,
        lucasMechanicalDevice: data.lucasMechanicalDevice,
        hgtRecording: data.hgtRecording,
        arterialBloodGases: data.arterialBloodGases,
        theatreDislocationLateralMalleolus: data.theatreDislocationLateralMalleolus,
        imInjection: data.imInjection,
        bandaging: data.bandaging,
        communicationTranslation: data.communicationTranslation,
      };

      const recordData = {
        student,
        discussionDate: data.discussionDate,
        discussionTime: data.discussionTime,
        companyNameLocation: data.companyNameLocation,
        conductorName: data.conductorName,
        conductorRole: data.conductorRole,
        peoplePresent: data.peoplePresent,
        discussedTopics: data.discussedTopics,
        studentActions: data.studentActions,
        evidenceAvailable: data.evidenceAvailable,
        followUpAttendance: data.followUpAttendance,
        attendanceRecorded: data.attendanceRecorded,
        attendanceSessions: data.attendanceSessions,
        challengesEncountered: data.challengesEncountered,
        interestingCases: data.interestingCases,
        skillsCompleted,
        sa2Discussion: data.sa2Discussion,
        assessmentCriteriaMet: data.assessmentCriteriaMet,
        conductorSignature,
        conductorSignatureDate: conductorSignature ? new Date() : undefined,
        studentSignature,
        studentSignatureDate: studentSignature ? new Date() : undefined,
      };

      const pdfBlob = await generateRecordOfDiscussionPDF(recordData);
      const filename = `Record_of_Discussion_${student.fullName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      downloadPDF(pdfBlob, filename);
      toast.success('PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-blue-900 text-white p-4 rounded-t-lg text-center font-bold text-lg">
        RECORD OF DISCUSSION
      </div>

      {/* Header Information */}
      <div className="grid grid-cols-2 gap-4 border-2 border-blue-900 p-4">
        <div>
          <Label>Student Name</Label>
          <Input value={student.fullName} disabled className="bg-gray-100" />
        </div>
        <div>
          <Label>Student ID #</Label>
          <Input value={student.studentId} disabled className="bg-gray-100" />
        </div>
        <div>
          <Label>Discussion Date *</Label>
          <Input type="date" {...register('discussionDate', { required: true })} />
          {errors.discussionDate && <span className="text-red-500 text-sm">Required</span>}
        </div>
        <div>
          <Label>Discussion Time</Label>
          <Input type="time" {...register('discussionTime')} />
        </div>
        <div className="col-span-2">
          <Label>Company Name & Workplace Location</Label>
          <Input {...register('companyNameLocation')} placeholder="e.g., SSMC" />
        </div>
        <div className="col-span-2">
          <Label>Name of Person Conducting Discussion *</Label>
          <Input {...register('conductorName', { required: true })} />
          {errors.conductorName && <span className="text-red-500 text-sm">Required</span>}
        </div>
        <div className="col-span-2">
          <Label>Role of Person Conducting Discussion</Label>
          <RadioGroup
            value={watchedValues.conductorRole}
            onValueChange={(value) => setValue('conductorRole', value)}
            className="flex gap-4 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Work Supervisor" id="work-supervisor" />
              <Label htmlFor="work-supervisor">Work Supervisor</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="HCT Mentor" id="hct-mentor" />
              <Label htmlFor="hct-mentor">HCT Mentor</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Record of Discussion */}
      <div className="border-2 border-blue-900">
        <div className="bg-gray-200 p-3 font-semibold">
          Record of the Discussion
          <div className="text-sm font-normal italic mt-1">Please include:</div>
        </div>
        <div className="p-4 space-y-2 text-sm">
          <ul className="list-disc list-inside space-y-1">
            <li>The people present</li>
            <li>What you discussed/questions/answers</li>
            <li>What the student did</li>
            <li>Any audio or visual evidence available</li>
          </ul>
        </div>
      </div>

      {/* Follow-up Meeting */}
      <div className="border-2 border-blue-900">
        <div className="bg-gray-200 p-3 font-semibold">Follow-up Meeting with Student</div>
        <div className="p-4 space-y-4">
          <div>
            <Label>Attendance:</Label>
            <Textarea {...register('followUpAttendance')} rows={3} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="attendance-recorded"
                checked={watchedValues.attendanceRecorded}
                onCheckedChange={(checked) => setValue('attendanceRecorded', checked as boolean)}
              />
              <Label htmlFor="attendance-recorded" className="font-normal">
                No absences recorded to date; attendance recorded for
              </Label>
              <Input
                type="number"
                {...register('attendanceSessions')}
                className="w-20"
                min="0"
              />
              <span>sessions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Challenges at Hospital */}
      <div className="border-2 border-blue-900">
        <div className="bg-gray-200 p-3 font-semibold">Challenges at Hospital:</div>
        <div className="p-4">
          <Textarea
            {...register('challengesEncountered')}
            rows={3}
            placeholder="Student reported no challenges encountered so far."
          />
        </div>
      </div>

      {/* Interesting Cases */}
      <div className="border-2 border-blue-900">
        <div className="bg-gray-200 p-3 font-semibold">Challenging/Interesting Cases:</div>
        <div className="p-4">
          <Textarea
            {...register('interestingCases')}
            rows={4}
            placeholder="Motor cycle accident that came in with a dislocation of the malleolus. Severe bleeding uncontrolled."
          />
        </div>
      </div>

      {/* Skills Completed */}
      <div className="border-2 border-blue-900">
        <div className="bg-gray-200 p-3 font-semibold">Skills Completed:</div>
        <div className="p-4">
          <p className="font-medium mb-3">Patient assessment including:</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="bp"
                checked={watchedValues.bloodPressure}
                onCheckedChange={(checked) => setValue('bloodPressure', checked as boolean)}
              />
              <Label htmlFor="bp" className="font-normal">Blood Pressure (BP)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="temp"
                checked={watchedValues.temperature}
                onCheckedChange={(checked) => setValue('temperature', checked as boolean)}
              />
              <Label htmlFor="temp" className="font-normal">Temperature (Temp)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rr"
                checked={watchedValues.respiratoryRate}
                onCheckedChange={(checked) => setValue('respiratoryRate', checked as boolean)}
              />
              <Label htmlFor="rr" className="font-normal">Respiratory Rate (RR)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hr"
                checked={watchedValues.heartRate}
                onCheckedChange={(checked) => setValue('heartRate', checked as boolean)}
              />
              <Label htmlFor="hr" className="font-normal">Heart Rate (HR)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="wound"
                checked={watchedValues.woundCare}
                onCheckedChange={(checked) => setValue('woundCare', checked as boolean)}
              />
              <Label htmlFor="wound" className="font-normal">Wound care</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sutures"
                checked={watchedValues.sutures}
                onCheckedChange={(checked) => setValue('sutures', checked as boolean)}
              />
              <Label htmlFor="sutures" className="font-normal">Sutures - Observed</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ecg"
                checked={watchedValues.ecg}
                onCheckedChange={(checked) => setValue('ecg', checked as boolean)}
              />
              <Label htmlFor="ecg" className="font-normal">ECG</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="swabs"
                checked={watchedValues.nasalThroatSwabs}
                onCheckedChange={(checked) => setValue('nasalThroatSwabs', checked as boolean)}
              />
              <Label htmlFor="swabs" className="font-normal">Nasal and throat swabs - observed</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="xray"
                checked={watchedValues.xrayObservation}
                onCheckedChange={(checked) => setValue('xrayObservation', checked as boolean)}
              />
              <Label htmlFor="xray" className="font-normal">X-rays observation - observed</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lucas"
                checked={watchedValues.lucasMechanicalDevice}
                onCheckedChange={(checked) => setValue('lucasMechanicalDevice', checked as boolean)}
              />
              <Label htmlFor="lucas" className="font-normal">Observed Lucas Mechanical Device</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hgt"
                checked={watchedValues.hgtRecording}
                onCheckedChange={(checked) => setValue('hgtRecording', checked as boolean)}
              />
              <Label htmlFor="hgt" className="font-normal">HGT recording - observed</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="abg"
                checked={watchedValues.arterialBloodGases}
                onCheckedChange={(checked) => setValue('arterialBloodGases', checked as boolean)}
              />
              <Label htmlFor="abg" className="font-normal">Arterial Blood gases - observed</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="theatre"
                checked={watchedValues.theatreDislocationLateralMalleolus}
                onCheckedChange={(checked) => setValue('theatreDislocationLateralMalleolus', checked as boolean)}
              />
              <Label htmlFor="theatre" className="font-normal">Theatre - dislocation lateral malleolus. Viewed the process</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="im"
                checked={watchedValues.imInjection}
                onCheckedChange={(checked) => setValue('imInjection', checked as boolean)}
              />
              <Label htmlFor="im" className="font-normal">IM injection</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="bandaging"
                checked={watchedValues.bandaging}
                onCheckedChange={(checked) => setValue('bandaging', checked as boolean)}
              />
              <Label htmlFor="bandaging" className="font-normal">Bandaging</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="comm"
                checked={watchedValues.communicationTranslation}
                onCheckedChange={(checked) => setValue('communicationTranslation', checked as boolean)}
              />
              <Label htmlFor="comm" className="font-normal">Assisting with communication and translation</Label>
            </div>
          </div>
        </div>
      </div>

      {/* SA2 Discussion */}
      <div className="border-2 border-blue-900">
        <div className="bg-gray-200 p-3 font-semibold">Discussion on SA 2 Assessment:</div>
        <div className="p-4">
          <Textarea
            {...register('sa2Discussion')}
            rows={3}
            placeholder="Reviewed requirements for the upcoming PP presentation and video submission: hand over"
          />
        </div>
      </div>

      {/* Assessment Criteria Met */}
      <div className="border-2 border-blue-900">
        <div className="bg-gray-200 p-3 font-semibold">Assessment Criteria Met:</div>
        <div className="p-4">
          <Textarea
            {...register('assessmentCriteriaMet')}
            rows={3}
            placeholder="Enter assessment criteria met (optional)"
          />
        </div>
      </div>

      {/* Signatures */}
      <div className="border-2 border-blue-900">
        <div className="bg-gray-200 p-3 font-semibold">Signatures</div>
        <div className="p-4 space-y-6">
          <div>
            <Label className="mb-2 block">Signature of the Person Conducting Discussion</Label>
            <SignaturePad
              value={conductorSignature}
              onChange={setConductorSignature}
              width={400}
              height={150}
            />
          </div>
          <div>
            <Label className="mb-2 block">Signature of Student</Label>
            <SignaturePad
              value={studentSignature}
              onChange={setStudentSignature}
              width={400}
              height={150}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={handleGeneratePDF}
          disabled={isGeneratingPDF}
        >
          {isGeneratingPDF ? 'Generating PDF...' : 'Generate PDF'}
        </Button>
        <Button
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Record'}
        </Button>
      </div>
    </form>
  );
}
