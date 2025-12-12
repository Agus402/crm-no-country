"use client";

import { ReplyMessageDTO } from "@/services/message.service";
import { Image, FileText, Play, Volume2, MessageSquare } from "lucide-react";

interface QuotedMessageProps {
    message: ReplyMessageDTO;
    isOwn: boolean; // If the current message is from the user (for styling)
}

/**
 * Displays a preview of a quoted/replied-to message
 */
export function QuotedMessage({ message, isOwn }: QuotedMessageProps) {
    const getMessagePreview = () => {
        switch (message.messageType) {
            case 'IMAGE':
                return (
                    <div className="flex items-center gap-1">
                        <Image className="h-3 w-3" />
                        <span>Imagen</span>
                    </div>
                );
            case 'VIDEO':
                return (
                    <div className="flex items-center gap-1">
                        <Play className="h-3 w-3" />
                        <span>Video</span>
                    </div>
                );
            case 'AUDIO':
                return (
                    <div className="flex items-center gap-1">
                        <Volume2 className="h-3 w-3" />
                        <span>Audio</span>
                    </div>
                );
            case 'DOCUMENT':
                return (
                    <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span>Documento</span>
                    </div>
                );
            case 'STICKER':
                return (
                    <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>Sticker</span>
                    </div>
                );
            default:
                return (
                    <span className="line-clamp-1">
                        {message.content}
                    </span>
                );
        }
    };

    const senderLabel = message.senderType === 'LEAD' ? 'Cliente' : 'Tú';

    return (
        <div
            className={`rounded-lg px-2 py-1 mb-1 border-l-2 text-xs ${isOwn
                    ? 'bg-purple-700/50 border-white/50 text-white/90'
                    : 'bg-slate-100 border-slate-400 text-slate-600'
                }`}
        >
            <div className={`font-semibold text-[10px] ${isOwn ? 'text-white/70' : 'text-slate-500'
                }`}>
                {senderLabel}
            </div>
            <div className="opacity-80">
                {getMessagePreview()}
            </div>
        </div>
    );
}
