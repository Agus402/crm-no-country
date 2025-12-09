"use client";

import { FileText, Download, Play } from "lucide-react";
import { useState } from "react";

interface MessageMediaProps {
    type: string;
    url: string;
    caption?: string;
    fileName?: string;
    isOwn: boolean;
}

export function MessageMedia({ type, url, caption, fileName, isOwn }: MessageMediaProps) {
    const [imageError, setImageError] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

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
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                >
                    Tu navegador no soporta el elemento video.
                </video>
                {caption && (
                    <p className="mt-1 text-sm opacity-90">{caption}</p>
                )}
            </div>
        );
    }

    // Handle audio types
    if (type?.startsWith('audio/') || type === 'AUDIO') {
        return (
            <div className="flex flex-col gap-2">
                <div className={`flex items-center gap-2 p-2 rounded-lg ${isOwn ? 'bg-purple-700' : 'bg-slate-200'}`}>
                    <Play className={`h-5 w-5 ${isOwn ? 'text-purple-200' : 'text-slate-500'}`} />
                    <audio
                        src={url}
                        controls
                        className="h-8 w-48"
                        preload="metadata"
                    />
                </div>
            </div>
        );
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
            <Download className={`h-5 w-5 flex-shrink-0 ${isOwn ? 'text-purple-200' : 'text-slate-500'}`} />
        </a>
    );
}
