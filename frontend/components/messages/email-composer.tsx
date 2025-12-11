"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    ListOrdered,
    Link as LinkIcon,
    Image as ImageIcon,
    Send,
    Loader2,
    PenSquare,
    X,
} from "lucide-react";
import { useState, useCallback } from "react";

interface EmailComposerProps {
    onSend: (subject: string, htmlContent: string) => Promise<void>;
    sending?: boolean;
    initialSubject?: string;
    showSubject?: boolean; // Solo mostrar subject en el primer email
    recipientEmail?: string;
    recipientName?: string;
}

export function EmailComposer({
    onSend,
    sending = false,
    initialSubject = "",
    showSubject = true,
    recipientEmail,
    recipientName,
}: EmailComposerProps) {
    const [subject, setSubject] = useState(initialSubject);
    const [hasContent, setHasContent] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-blue-600 underline",
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: "max-w-full rounded-lg",
                },
            }),
            Underline,
        ],
        content: "",
        editorProps: {
            attributes: {
                class:
                    "prose prose-sm max-w-none min-h-[150px] p-4 focus:outline-none",
            },
        },
        onUpdate: ({ editor }) => {
            // Track if editor has actual content (not just empty paragraph)
            const text = editor.getText().trim();
            setHasContent(text.length > 0);
        },
    });

    const handleSend = useCallback(async () => {
        if (!editor) return;
        const html = editor.getHTML();
        if (!hasContent) return;
        if (showSubject && !subject.trim()) return;

        await onSend(subject, html);
        // Clear after send
        editor.commands.clearContent();
        setSubject("");
        setHasContent(false);
    }, [editor, subject, showSubject, onSend, hasContent]);

    const addLink = useCallback(() => {
        if (!editor) return;
        const url = window.prompt("URL del enlace:");
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    }, [editor]);

    const addImage = useCallback(() => {
        if (!editor) return;
        const url = window.prompt("URL de la imagen:");
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    if (!editor) {
        return null;
    }

    // Button should be disabled if:
    // - Currently sending
    // - No content in editor
    // - Subject is required but empty
    const isDisabled = sending || !hasContent || (showSubject && !subject.trim());

    // Collapsed mode - just show a button to compose
    if (!isExpanded) {
        return (
            <Button
                onClick={() => setIsExpanded(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
                <PenSquare className="h-4 w-4 mr-2" />
                Redactar Email
            </Button>
        );
    }

    return (
        <div className="border rounded-lg bg-white shadow-sm">
            {/* Header with close button */}
            <div className="flex items-center justify-between px-4 py-2 border-b bg-slate-50">
                <span className="text-sm font-medium text-slate-700">Nuevo Email</span>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setIsExpanded(false)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Recipient Info */}
            {(recipientEmail || recipientName) && (
                <div className="px-4 py-2 border-b">
                    <p className="text-sm text-slate-600">
                        <span className="font-medium">Para:</span>{" "}
                        {recipientName && <span>{recipientName} </span>}
                        {recipientEmail && (
                            <span className="text-slate-500">&lt;{recipientEmail}&gt;</span>
                        )}
                    </p>
                </div>
            )}

            {/* Subject Field */}
            {showSubject && (
                <div className="px-4 py-3 border-b">
                    <div className="flex items-center gap-3">
                        <Label htmlFor="subject" className="text-sm font-medium w-16">
                            Asunto:
                        </Label>
                        <Input
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Escribe el asunto del email..."
                            className="flex-1 border-0 bg-transparent focus-visible:ring-0 p-0 h-auto"
                        />
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center gap-1 px-3 py-2 border-b bg-slate-50 flex-wrap">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={editor.isActive("bold") ? "bg-slate-200" : ""}
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive("italic") ? "bg-slate-200" : ""}
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={editor.isActive("underline") ? "bg-slate-200" : ""}
                >
                    <UnderlineIcon className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive("bulletList") ? "bg-slate-200" : ""}
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={editor.isActive("orderedList") ? "bg-slate-200" : ""}
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addLink}
                    className={editor.isActive("link") ? "bg-slate-200" : ""}
                >
                    <LinkIcon className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={addImage}>
                    <ImageIcon className="h-4 w-4" />
                </Button>

                {/* Send Button */}
                <div className="flex-1" />
                <Button
                    onClick={handleSend}
                    disabled={isDisabled}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <Send className="h-4 w-4 mr-2" />
                    )}
                    Enviar Email
                </Button>
            </div>

            {/* Editor */}
            <EditorContent
                editor={editor}
                className="min-h-[200px] max-h-[400px] overflow-y-auto"
            />
        </div>
    );
}
