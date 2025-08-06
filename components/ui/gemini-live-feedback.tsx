
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Alert, AlertDescription } from './alert';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageCircle, 
  Bot, 
  User, 
  Zap,
  AlertCircle,
  RefreshCw,
  Activity,
  Eye
} from 'lucide-react';
import { Skill } from '@/lib/types';

interface GeminiMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: number;
  feedbackType?: 'encouragement' | 'correction' | 'guidance' | 'warning';
}

interface GeminiLiveFeedbackProps {
  skill: Skill;
  currentStep: number;
  isRecording: boolean;
  trackingData?: {
    handPositions: Array<{x: number, y: number}>;
    posePositions: Array<{x: number, y: number}>;
    accuracyScore: number;
    targetHits: number;
  };
  onFeedbackReceived?: (feedback: string) => void;
  className?: string;
}

export function GeminiLiveFeedback({
  skill,
  currentStep,
  isRecording,
  trackingData,
  onFeedbackReceived,
  className = ''
}: GeminiLiveFeedbackProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<GeminiMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [error, setError] = useState<string>('');
  const [lastFeedbackTime, setLastFeedbackTime] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Gemini Live connection
  const initializeGeminiLive = useCallback(async () => {
    setIsConnecting(true);
    setError('');

    try {
      // Create WebSocket connection to our API
      const ws = new WebSocket(`ws://localhost:3000/api/gemini-live?skillId=${skill.id}`);
      
      ws.onopen = () => {
        console.log('✅ Gemini Live connection established');
        setIsConnected(true);
        setIsConnecting(false);
        
        // Send initial context
        const initialContext = {
          type: 'initialize',
          skill: skill.name,
          steps: skill.steps?.map(step => ({
            number: step.stepNumber,
            title: step.title,
            description: step.description,
            keyPoints: step.keyPoints
          })),
          objectives: skill.objectives,
          commonErrors: skill.commonErrors
        };
        
        ws.send(JSON.stringify(initialContext));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'feedback') {
          handleAIFeedback(data.content, data.feedbackType);
        } else if (data.type === 'error') {
          setError(data.message);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ Gemini Live connection error:', error);
        setError('Connection to AI coach failed');
        setIsConnecting(false);
      };

      ws.onclose = () => {
        console.log('🔌 Gemini Live connection closed');
        setIsConnected(false);
        setIsConnecting(false);
      };

      wsRef.current = ws;

      // Initialize audio context for voice input
      if (voiceEnabled) {
        await initializeAudioInput();
      }

    } catch (error) {
      console.error('❌ Failed to initialize Gemini Live:', error);
      setError('Failed to connect to AI coach');
      setIsConnecting(false);
    }
  }, [skill, voiceEnabled]);

  // Initialize audio input for voice interaction
  const initializeAudioInput = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (event) => {
        if (isListening && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const inputBuffer = event.inputBuffer.getChannelData(0);
          const audioData = Array.from(inputBuffer);
          
          // Send audio data to Gemini Live
          wsRef.current.send(JSON.stringify({
            type: 'audio',
            data: audioData,
            timestamp: Date.now()
          }));
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

    } catch (error) {
      console.error('❌ Audio initialization failed:', error);
    }
  }, [isListening]);

  // Handle AI feedback
  const handleAIFeedback = useCallback((content: string, feedbackType: string) => {
    const message: GeminiMessage = {
      id: Date.now().toString(),
      type: 'assistant',
      content,
      timestamp: Date.now(),
      feedbackType: feedbackType as any
    };

    setMessages(prev => [...prev, message]);
    onFeedbackReceived?.(content);

    // Text-to-speech if enabled
    if (voiceEnabled && !isSpeaking) {
      speakFeedback(content, feedbackType);
    }

    setLastFeedbackTime(Date.now());
  }, [voiceEnabled, isSpeaking, onFeedbackReceived]);

  // Text-to-speech for AI feedback
  const speakFeedback = useCallback((text: string, feedbackType: string) => {
    if (!window.speechSynthesis) return;

    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    // Adjust voice characteristics based on feedback type
    switch (feedbackType) {
      case 'encouragement':
        utterance.rate = 1.1;
        utterance.pitch = 1.1;
        break;
      case 'warning':
        utterance.rate = 0.8;
        utterance.pitch = 0.9;
        break;
      case 'correction':
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        break;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  // Send tracking data to Gemini Live
  const sendTrackingData = useCallback(() => {
    if (!wsRef.current || !trackingData || !isConnected) return;

    const trackingUpdate = {
      type: 'tracking_update',
      currentStep,
      data: trackingData,
      timestamp: Date.now()
    };

    wsRef.current.send(JSON.stringify(trackingUpdate));
  }, [currentStep, trackingData, isConnected]);

  // Start/stop voice listening
  const toggleListening = useCallback(() => {
    setIsListening(!isListening);
  }, [isListening]);

  // Toggle voice output
  const toggleVoice = useCallback(() => {
    if (isSpeaking && speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setVoiceEnabled(!voiceEnabled);
  }, [isSpeaking, voiceEnabled]);

  // Send tracking data periodically
  useEffect(() => {
    if (isRecording && isConnected && trackingData) {
      const interval = setInterval(sendTrackingData, 2000); // Send every 2 seconds
      return () => clearInterval(interval);
    }
  }, [isRecording, isConnected, trackingData, sendTrackingData]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getFeedbackIcon = (feedbackType?: string) => {
    switch (feedbackType) {
      case 'encouragement':
        return <Activity className="h-4 w-4 text-green-500" />;
      case 'correction':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'guidance':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bot className="h-4 w-4 text-gray-500" />;
    }
  };

  const getFeedbackColor = (feedbackType?: string) => {
    switch (feedbackType) {
      case 'encouragement':
        return 'border-green-200 bg-green-50';
      case 'correction':
        return 'border-yellow-200 bg-yellow-50';
      case 'guidance':
        return 'border-blue-200 bg-blue-50';
      case 'warning':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            AI Coach Live
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={isConnected ? "default" : "secondary"}
              className={isConnected ? "bg-green-500" : "bg-gray-500"}
            >
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            {isRecording && (
              <Badge variant="outline" className="border-red-200 text-red-700">
                <Activity className="h-3 w-3 mr-1" />
                Live Coaching
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Connection Status */}
          {!isConnected && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-800">AI Coach Available</p>
                    <p className="text-sm text-blue-600">
                      Connect to receive real-time guidance during your practice
                    </p>
                  </div>
                  <Button 
                    onClick={initializeGeminiLive}
                    disabled={isConnecting}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Connect AI Coach
                      </>
                    )}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                <p className="font-medium text-red-800">Connection Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </AlertDescription>
            </Alert>
          )}

          {/* Controls */}
          {isConnected && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleListening}
                  className={isListening ? "bg-red-50 border-red-200 text-red-700" : ""}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-4 w-4 mr-2" />
                      Stop Listening
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-2" />
                      Start Listening
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleVoice}
                  className={voiceEnabled ? "bg-green-50 border-green-200 text-green-700" : ""}
                >
                  {voiceEnabled ? (
                    <>
                      <Volume2 className="h-4 w-4 mr-2" />
                      Voice On
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-4 w-4 mr-2" />
                      Voice Off
                    </>
                  )}
                </Button>
              </div>
              
              <div className="text-sm text-gray-600">
                Step {currentStep} of {skill.steps?.length || 1}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {messages.length === 0 && isConnected && (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>AI coach is ready to help you!</p>
                <p className="text-sm">Start practicing to receive real-time guidance</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : `${getFeedbackColor(message.feedbackType)} text-gray-800`
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.type === 'assistant' && getFeedbackIcon(message.feedbackType)}
                    {message.type === 'user' && <User className="h-4 w-4 text-white" />}
                    <div className="flex-1">
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Status Indicators */}
          {isConnected && (
            <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
                  <span>Listening</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`} />
                  <span>Speaking</span>
                </div>
              </div>
              <div>
                Last feedback: {lastFeedbackTime ? new Date(lastFeedbackTime).toLocaleTimeString() : 'None'}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default GeminiLiveFeedback;
