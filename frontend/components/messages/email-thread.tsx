"use client";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    ChevronDown,
    ChevronUp,
    Reply,
    Mail,
    Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MessageDTO } from "@/services/message.service";

interface EmailMessageProps {
    message: MessageDTO;
    isOwn: boolean;
    senderName: string;
    recipientName?: string;
}

function formatEmailDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getInitials(name: string): string {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// Clean email content - remove quoted replies and signatures
function cleanEmailContent(content: string): string {
    if (!content) return '';

    // Remove common email reply patterns
    let cleaned = content;

    // Remove "El [date] escribió:" pattern and everything after
    cleaned = cleaned.replace(/El\s+(lun|mar|mié|jue|vie|sáb|dom)[^<]*escribió:[^]*$/i, '');
    cleaned = cleaned.replace(/On\s+\w+,\s+\w+\s+\d+[^<]*wrote:[^]*$/i, '');

    // Remove common signature patterns
    cleaned = cleaned.replace(/--\s*<br\s*\/?>/gi, '');
    cleaned = cleaned.replace(/<p>--<\/p>[^]*$/i, '');

    return cleaned.trim();
}

export function EmailMessage({
    message,
    isOwn,
    senderName,
    recipientName
}: EmailMessageProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const cleanedContent = cleanEmailContent(message.content);

    return (
        <Card className={cn(
            "mb-3 overflow-hidden transition-shadow hover:shadow-md",
            isOwn ? "border-l-4 border-l-blue-500" : "border-l-4 border-l-slate-300"
        )}>
            {/* Email Header */}
            <div
                className="flex items-start gap-3 p-4 cursor-pointer hover:bg-slate-50"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className={cn(
                        isOwn ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"
                    )}>
                        {getInitials(senderName)}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="font-semibold text-sm truncate">
                                {senderName}
                            </span>
                            {isOwn && (
                                <span className="text-xs text-slate-500">
                                    → {recipientName || 'Destinatario'}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatEmailDate(message.sentAt)}
                            </span>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                {isExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {!isExpanded && (
                        <p className="text-sm text-slate-500 truncate mt-1">
                            {message.content?.replace(/<[^>]*>/g, '').slice(0, 100)}...
                        </p>
                    )}
                </div>
            </div>

            {/* Email Body */}
            {isExpanded && (
                <div className="px-4 pb-4">
                    <div className="ml-13 pl-[52px]">
                        {/* Render HTML content */}
                        <div
                            className="prose prose-sm max-w-none text-slate-700"
                            dangerouslySetInnerHTML={{ __html: cleanedContent }}
                        />
                    </div>

                    {/* Email Footer Actions */}
                    <div className="flex items-center gap-2 mt-4 ml-[52px] pt-3 border-t">
                        <Button variant="outline" size="sm" className="text-xs">
                            <Reply className="h-3 w-3 mr-1" />
                            Responder
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}

interface EmailThreadProps {
    messages: MessageDTO[];
    leadName: string;
    userName: string;
}

export function EmailThread({ messages, leadName, userName }: EmailThreadProps) {
    if (messages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Mail className="h-12 w-12 mb-4 text-slate-300" />
                <p className="text-lg font-medium">No hay emails</p>
                <p className="text-sm">Envía el primer email para iniciar la conversación</p>
            </div>
        );
    }

    return (
        <div className="space-y-2 p-4">
            {messages.map((message) => {
                const isOwn = message.messageDirection === 'OUTBOUND';
                const senderName = isOwn ? userName : leadName;
                const recipientName = isOwn ? leadName : userName;

                return (
                    <EmailMessage
                        key={message.id}
                        message={message}
                        isOwn={isOwn}
                        senderName={senderName}
                        recipientName={recipientName}
                    />
                );
            })}
        </div>
    );
}
