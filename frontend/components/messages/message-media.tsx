"use client";

import { FileText, Download } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";

interface MessageMediaProps {
    type: string;
    url: string;
    caption?: string;
    fileName?: string;
    isOwn: boolean;
}

// Custom Audio Player Component
function AudioPlayer({ url, isOwn }: { url: string; isOwn: boolean }) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const animationRef = useRef<number>(0);
    const isPlayingRef = useRef(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Animation loop for smooth progress - uses ref to check playing state
    const animate = () => {
        const audio = audioRef.current;
        if (audio && isPlayingRef.current) {
            setCurrentTime(audio.currentTime);
            animationRef.current = requestAnimationFrame(animate);
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleEnded = () => {
            isPlayingRef.current = false;
            setIsPlaying(false);
            cancelAnimationFrame(animationRef.current);
            // Ensure progress shows 100% when ended
            if (audio.duration) {
                setCurrentTime(audio.duration);
            }
        };

        const handlePlay = () => {
            isPlayingRef.current = true;
            setIsPlaying(true);
            animationRef.current = requestAnimationFrame(animate);
        };

        const handlePause = () => {
            isPlayingRef.current = false;
            setIsPlaying(false);
            cancelAnimationFrame(animationRef.current);
            setCurrentTime(audio.currentTime);
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            cancelAnimationFrame(animationRef.current);
        };
    }, []);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const audio = audioRef.current;
        if (!audio || !duration) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        const newTime = percentage * duration;

        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const formatTime = (seconds: number): string => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className={`flex items-center gap-3 px-3 py-2 rounded-2xl min-w-[180px] max-w-[250px] ${isOwn ? 'bg-purple-600' : 'bg-slate-200'
            }`}>
            {/* Hidden audio element */}
            <audio ref={audioRef} src={url} preload="metadata" />

            {/* Play/Pause Button */}
            <button
                onClick={togglePlay}
                className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 transition-colors ${isOwn
                    ? 'bg-white/20 hover:bg-white/30 text-white'
                    : 'bg-slate-300 hover:bg-slate-400 text-slate-700'
                    }`}
            >
                {isPlaying ? (
                    <Pause className="h-4 w-4" />
                ) : (
                    <Play className="h-4 w-4 ml-0.5" />
                )}
            </button>

            {/* Progress Bar and Time */}
            <div className="flex-1 flex flex-col gap-1">
                {/* Progress Bar */}
                <div
                    className={`h-1 rounded-full cursor-pointer ${isOwn ? 'bg-white/30' : 'bg-slate-300'
                        }`}
                    onClick={handleProgressClick}
                >
                    <div
                        className={`h-full rounded-full ${isOwn ? 'bg-white' : 'bg-slate-600'}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Time Display */}
                <div className={`text-xs font-mono ${isOwn ? 'text-white/80' : 'text-slate-500'
                    }`}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                </div>
            </div>
        </div>
    );
}

export function MessageMedia({ type, url, caption, fileName, isOwn }: MessageMediaProps) {
    const [imageError, setImageError] = useState(false);

    // Handle image types
    if (type?.startsWith('image/') || type === 'IMAGE' || type === 'STICKER') {
        if (imageError) {
            return (
                <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg">
                    <FileText className="h-6 w-6 text-slate-400" />
                    <span className="text-sm text-slate-600">Imagen no disponible</span>
                </div>
            );
        }
        return (
            <div className="relative max-w-[280px]">
                <img
                    src={url}
                    alt={caption || "Imagen"}
                    className="rounded-lg max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(url, '_blank')}
                    onError={() => setImageError(true)}
                />
                {caption && (
                    <p className="mt-1 text-sm opacity-90">{caption}</p>
                )}
            </div>
        );
    }

    // Handle video types
    if (type?.startsWith('video/') || type === 'VIDEO') {
        return (
            <div className="relative max-w-[280px]">
                <video
                    src={url}
                    controls
                    className="rounded-lg max-w-full"
                    preload="metadata"
                >
                    Tu navegador no soporta el elemento video.
                </video>
                {caption && (
                    <p className="mt-1 text-sm opacity-90">{caption}</p>
                )}
            </div>
        );
    }

    // Handle audio types - custom player
    if (type?.startsWith('audio/') || type === 'AUDIO') {
        return <AudioPlayer url={url} isOwn={isOwn} />;
    }

    // Handle documents and other file types
    const displayName = fileName || url.split('/').pop() || 'Documento';
    const extension = displayName.split('.').pop()?.toUpperCase() || 'FILE';

    return (
        <a
            href={url}
            download={fileName}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isOwn
                ? 'bg-purple-700 hover:bg-purple-800'
                : 'bg-slate-200 hover:bg-slate-300'
                }`}
        >
            <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${isOwn ? 'bg-purple-500' : 'bg-slate-300'
                }`}>
                <FileText className={`h-5 w-5 ${isOwn ? 'text-white' : 'text-slate-600'}`} />
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isOwn ? 'text-white' : 'text-slate-900'}`}>
                    {displayName}
                </p>
                <p className={`text-xs ${isOwn ? 'text-purple-200' : 'text-slate-500'}`}>
                    {extension}
                </p>
            </div>
            <Download className={`h-5 w-5 shrink-0 ${isOwn ? 'text-purple-200' : 'text-slate-500'}`} />
        </a>
    );
}
