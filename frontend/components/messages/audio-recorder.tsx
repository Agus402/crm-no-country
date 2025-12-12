"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Send, Trash2, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AudioRecorderProps {
    onRecordingComplete: (audioBlob: Blob) => void;
    onCancel?: () => void;
    disabled?: boolean;
    autoStart?: boolean;
    onRecordingStateChange?: (isRecording: boolean) => void;
}

type RecordingState = "idle" | "recording" | "paused";

export function AudioRecorder({
    onRecordingComplete,
    onCancel,
    disabled = false,
    autoStart = true,
    onRecordingStateChange,
}: AudioRecorderProps) {
    const [recordingState, setRecordingState] = useState<RecordingState>("idle");
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const hasStartedRef = useRef(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Notify parent of recording state changes
    useEffect(() => {
        onRecordingStateChange?.(recordingState !== "idle");
    }, [recordingState, onRecordingStateChange]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopTimer();
            cleanupStream();
        };
    }, []);

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const startTimer = () => {
        stopTimer();
        timerRef.current = setInterval(() => {
            setDuration((prev) => prev + 1);
        }, 1000);
    };

    const cleanupStream = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    };

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const startRecording = useCallback(async () => {
        try {
            setError(null);
            chunksRef.current = [];

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // WhatsApp Cloud API requires OGG/Opus format for voice messages
            // Fallback order: ogg/opus (preferred by WhatsApp) -> webm/opus -> webm
            let mimeType = "audio/webm";
            if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
                mimeType = "audio/ogg;codecs=opus";
            } else if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
                mimeType = "audio/webm;codecs=opus";
            }
            console.log("🎤 Audio recording format:", mimeType);

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.start(100); // Collect data every 100ms
            setRecordingState("recording");
            setDuration(0);
            startTimer();
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("No se pudo acceder al micrófono. Por favor, permite el acceso.");
            setRecordingState("idle");
        }
    }, []);

    // Auto-start recording when component mounts
    useEffect(() => {
        if (autoStart && !hasStartedRef.current && recordingState === "idle") {
            hasStartedRef.current = true;
            startRecording();
        }
    }, [autoStart, startRecording, recordingState]);

    const pauseRecording = useCallback(() => {
        if (mediaRecorderRef.current && recordingState === "recording") {
            mediaRecorderRef.current.pause();
            stopTimer();
            setRecordingState("paused");
        }
    }, [recordingState]);

    const resumeRecording = useCallback(() => {
        if (mediaRecorderRef.current && recordingState === "paused") {
            mediaRecorderRef.current.resume();
            startTimer();
            setRecordingState("recording");
        }
    }, [recordingState]);

    const stopAndSend = useCallback(() => {
        if (mediaRecorderRef.current && (recordingState === "recording" || recordingState === "paused")) {
            stopTimer();

            // Set up the onstop handler to send the audio
            mediaRecorderRef.current.onstop = () => {
                const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
                const audioBlob = new Blob(chunksRef.current, { type: mimeType });
                cleanupStream();
                chunksRef.current = [];
                setDuration(0);
                setRecordingState("idle");

                // Send the audio
                onRecordingComplete(audioBlob);
            };

            mediaRecorderRef.current.stop();
        }
    }, [recordingState, onRecordingComplete]);

    const cancelRecording = useCallback(() => {
        stopTimer();
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.onstop = null; // Don't trigger send
            mediaRecorderRef.current.stop();
        }
        cleanupStream();
        chunksRef.current = [];
        setDuration(0);
        setRecordingState("idle");
        setError(null);
        onCancel?.();
    }, [onCancel]);

    // Idle state - show loading (auto-starting) or error
    if (recordingState === "idle") {
        return (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg flex-1">
                {error ? (
                    <>
                        <span className="text-xs text-red-500 flex-1">{error}</span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onCancel?.()}
                        >
                            Cancelar
                        </Button>
                    </>
                ) : (
                    <span className="text-sm text-slate-500">Iniciando grabación...</span>
                )}
            </div>
        );
    }

    // Recording or Paused state - show recording controls
    return (
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg flex-1">
            {/* Cancel button */}
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500 hover:text-red-500"
                onClick={cancelRecording}
                title="Cancelar grabación"
            >
                <Trash2 className="h-4 w-4" />
            </Button>

            {/* Recording indicator */}
            <div className="flex items-center gap-2 flex-1">
                <div
                    className={cn(
                        "h-3 w-3 rounded-full",
                        recordingState === "recording"
                            ? "bg-red-500 animate-pulse"
                            : "bg-yellow-500"
                    )}
                />
                <span className="text-sm font-mono text-slate-700">
                    {formatDuration(duration)}
                </span>
                <span className="text-xs text-slate-500">
                    {recordingState === "paused" ? "Pausado" : "Grabando..."}
                </span>
            </div>

            {/* Pause/Resume button */}
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={recordingState === "recording" ? pauseRecording : resumeRecording}
                title={recordingState === "recording" ? "Pausar" : "Reanudar"}
            >
                {recordingState === "recording" ? (
                    <Pause className="h-4 w-4" />
                ) : (
                    <Play className="h-4 w-4" />
                )}
            </Button>

            {/* Send button (stops and sends directly) */}
            <Button
                type="button"
                size="icon"
                className="h-8 w-8 bg-purple-600 hover:bg-purple-700"
                onClick={stopAndSend}
                disabled={disabled}
                title="Enviar audio"
            >
                <Send className="h-4 w-4" />
            </Button>
        </div>
    );
}
