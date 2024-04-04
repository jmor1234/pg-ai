import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic2Icon } from "lucide-react";

interface AudioRecorderProps {
  onTranscriptionComplete: (transcription: string) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onTranscriptionComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.addEventListener("dataavailable", (event) => {
        chunksRef.current.push(event.data);
      });

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting audio recording:", error);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.addEventListener('stop', handleAudioUpload, { once: true });
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAudioUpload = async () => {
    if (chunksRef.current.length === 0) {
      return;
    }

    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    const file = new File([blob], "audio.webm", {
      type: "audio/webm",
      lastModified: Date.now(),
    });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/notes/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      onTranscriptionComplete(result.text);

    } catch (error) {
      console.error("Error in audio transcription:", error);
    }
  };

  return (
    <Button
      className="w-full bg-secondary text-primary hover:bg-primary hover:text-secondary"
      type="button"
      variant="ghost"
      size="icon"
      onClick={isRecording ? stopRecording : startRecording}
    >
      <Mic2Icon className="w-5 h-5 mr-2" />
      {isRecording ? "Stop" : "Audio"}
    </Button>
  );
};

export default AudioRecorder;