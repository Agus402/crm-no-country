"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Send, Paperclip, MessageCircle, Mail, MoreVertical, ArrowLeft, Loader2, Wifi, WifiOff, Plus, Download, Trash2, X, Mic, Reply } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { conversationService, ConversationDTO } from "@/services/conversation.service";
import { messageService, MessageDTO } from "@/services/message.service";
import { websocketService, WebSocketMessage } from "@/services/websocket.service";
import { toast } from "sonner";
import { NewConversationModal } from "@/components/messages/new-conversation-modal";
import { MessageMedia } from "@/components/messages/message-media";
import { QuotedMessage } from "@/components/messages/quoted-message";
import { EmailComposer } from "@/components/messages/email-composer";
import { EmailThread } from "@/components/messages/email-thread";
import { AudioRecorder } from "@/components/messages/audio-recorder";
import { useAuth } from "@/context/AuthContext";

// Función para eliminar etiquetas HTML del texto de vista previa
const stripHtmlTags = (html: string | null): string => {
  if (!html) return '';
  // Elimina todas las etiquetas HTML y decodifica entidades básicas
  return html
    .replace(/<[^>]*>/g, '') // Elimina etiquetas HTML
    .replace(/&nbsp;/g, ' ') // Reemplaza &nbsp; por espacio
    .replace(/&amp;/g, '&')  // Decodifica &amp;
    .replace(/&lt;/g, '<')   // Decodifica &lt;
    .replace(/&gt;/g, '>')   // Decodifica &gt;
    .replace(/&quot;/g, '"') // Decodifica &quot;
    .replace(/&#39;/g, "'")  // Decodifica &#39;
    .trim();
};

// Función para formatear la vista previa de mensajes multimedia
const formatMessagePreview = (text: string | null): string => {
  if (!text) return 'Sin mensajes';

  const cleanText = stripHtmlTags(text).trim();

  // If empty after cleaning, return a default
  if (!cleanText) return 'Sin mensajes';

  // Detectar tipos de media por patrones comunes
  if (cleanText === '[Audio]' || cleanText.toLowerCase().startsWith('audio_')) {
    return '🎵 Audio';
  }
  if (cleanText.toLowerCase().includes('.gif') || cleanText.toLowerCase() === 'gif') {
    return '🎬 GIF';
  }
  if (cleanText.match(/\.(jpg|jpeg|png|webp)$/i) || cleanText.toLowerCase() === 'image' || cleanText.toLowerCase() === 'imagen') {
    return '📷 Foto';
  }
  if (cleanText.match(/\.(mp4|mov|avi|webm)$/i) || cleanText.toLowerCase() === 'video') {
    return '🎥 Video';
  }
  if (cleanText.match(/\.(pdf|doc|docx|xls|xlsx)$/i)) {
    return '📎 Documento';
  }

  return cleanText;
};

export default function Message() {
  const { user } = useAuth();

  // Estado de datos
  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationDTO | null>(null);

  // Estado de UI
  const [messageInput, setMessageInput] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Estado de carga
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [replyingTo, setReplyingTo] = useState<MessageDTO | null>(null); // Message being replied to
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageRefs = useRef<Map<number, HTMLDivElement>>(new Map()); // Refs for scroll-to-message

  // Ref para scroll automático
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Ref para evitar auto-selección después de la primera carga
  const hasSelectedInitialRef = useRef(false);
  // Ref para la conversación seleccionada (para usar en callbacks de WebSocket)
  const selectedConversationRef = useRef<ConversationDTO | null>(null);
  // Ref para suscripciones WebSocket
  const wsSubscriptionsRef = useRef<string[]>([]);

  // Mantener ref sincronizada con state
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // Handler para notificaciones WebSocket
  const handleWebSocketMessage = useCallback((notification: WebSocketMessage) => {
    console.log('📩 Notificación WebSocket recibida:', notification);

    if (notification.type === 'NEW_MESSAGE' || notification.type === 'MESSAGE_SENT') {
      // Recargar mensajes si la conversación activa recibió el mensaje
      if (selectedConversationRef.current?.id === notification.conversationId) {
        loadMessages(notification.conversationId);
        // Mark as read immediately since user is viewing this conversation
        conversationService.markAsRead(notification.conversationId).catch(err =>
          console.error('Error marking as read:', err)
        );
      }
      // Siempre recargar lista de conversaciones para actualizar último mensaje
      loadConversations(false);
    }
  }, []);

  // Conectar WebSocket y suscribirse al montar
  useEffect(() => {
    loadConversations(true);

    // Conectar WebSocket
    websocketService.connect(() => {
      setWsConnected(true);
      // Suscribirse al topic global de conversaciones
      const subId = websocketService.subscribe('/topic/conversations', handleWebSocketMessage);
      if (subId) wsSubscriptionsRef.current.push(subId);
    });

    return () => {
      // Limpiar suscripciones al desmontar
      wsSubscriptionsRef.current.forEach(id => websocketService.unsubscribe(id));
      wsSubscriptionsRef.current = [];
    };
  }, [handleWebSocketMessage]);

  // Suscribirse a la conversación específica cuando cambia la selección
  useEffect(() => {
    if (selectedConversation && wsConnected) {
      loadMessages(selectedConversation.id);

      // Suscribirse al topic específico de la conversación
      const subId = websocketService.subscribe(
        `/topic/conversations/${selectedConversation.id}`,
        handleWebSocketMessage
      );
      if (subId) wsSubscriptionsRef.current.push(subId);

      return () => {
        // No desuscribir aquí, mantener las suscripciones activas
      };
    }
  }, [selectedConversation?.id, wsConnected, handleWebSocketMessage]);

  // Scroll automático al final de los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async (allowAutoSelect: boolean = false) => {
    try {
      const data = await conversationService.getAll();
      setConversations(data);

      // Solo auto-seleccionar en la primera carga si no hay conversación seleccionada
      if (allowAutoSelect && !hasSelectedInitialRef.current && data.length > 0) {
        setSelectedConversation(data[0]);
        hasSelectedInitialRef.current = true;
      }
    } catch (error) {
      toast.error("Error al cargar conversaciones", {
        description: "No se pudieron obtener las conversaciones. Verifica tu conexión."
      });
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadMessages = async (conversationId: number) => {
    try {
      setLoadingMessages(true);
      const data = await messageService.getByConversation(conversationId);
      setMessages(data);
    } catch (error) {
      toast.error("Error al cargar mensajes", {
        description: "No se pudieron obtener los mensajes de esta conversación."
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  // Scroll to a specific message (for clicking on quoted messages)
  const scrollToMessage = (messageId: number) => {
    const element = messageRefs.current.get(messageId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Flash highlight effect
      element.classList.add('bg-yellow-100');
      setTimeout(() => element.classList.remove('bg-yellow-100'), 1500);
    }
  };

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && !selectedFile) || !selectedConversation || sendingMessage || uploadingFile) return;

    try {
      setSendingMessage(true);

      // If there's a file, upload it first
      if (selectedFile) {
        setUploadingFile(true);
        try {
          const uploadResult = await messageService.uploadMedia(selectedFile);
          const messageType = messageService.getMessageTypeFromMime(uploadResult.mimeType);

          await messageService.sendMessage({
            conversationId: selectedConversation.id,
            content: messageInput.trim() || uploadResult.filename,
            messageType: messageType,
            mediaUrl: uploadResult.url,
            mediaFileName: uploadResult.filename,
            mediaCaption: messageInput.trim() || undefined,
            replyToMessageId: replyingTo?.id, // Include reply reference
          });

          setSelectedFile(null);
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } finally {
          setUploadingFile(false);
        }
      } else {
        // Text-only message
        await messageService.sendMessage({
          conversationId: selectedConversation.id,
          content: messageInput.trim(),
          replyToMessageId: replyingTo?.id, // Include reply reference
        });
      }

      setMessageInput('');
      setReplyingTo(null); // Clear reply state after sending
      // Recargar mensajes después de enviar
      await loadMessages(selectedConversation.id);
      // Actualizar lista de conversaciones para reflejar último mensaje
      await loadConversations();
    } catch (error: unknown) {
      // Mostrar el mensaje de error del backend o uno genérico
      const errorMessage = error instanceof Error
        ? error.message
        : "No se pudo enviar el mensaje. Intenta nuevamente.";

      toast.error("Error al enviar mensaje", {
        description: errorMessage,
        duration: 6000,
      });
    } finally {
      setSendingMessage(false);
    }
  };

  // Exportar conversación a CSV
  const exportConversationCSV = async (conv: ConversationDTO) => {
    try {
      const msgs = await messageService.getByConversation(conv.id);
      const csvContent = [
        "Fecha,Autor,Dirección,Contenido",
        ...msgs.map((m: MessageDTO) => {
          // Determinar el autor del mensaje según la dirección
          // OUTBOUND = enviado por el usuario asignado (o usuario actual si no hay asignado)
          // INBOUND = recibido del lead
          const author = m.messageDirection === 'OUTBOUND'
            ? (conv.assignedUser?.name || user?.name || 'Usuario')
            : (conv.lead?.name || 'Lead');

          const direction = m.messageDirection === 'OUTBOUND' ? 'Enviado' : 'Recibido';
          const content = m.content?.replace(/"/g, '""') || '';
          const date = new Date(m.sentAt).toLocaleString();

          return `"${date}","${author}","${direction}","${content}"`;
        })
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `conversacion_${conv.lead?.name || conv.id}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("Conversación exportada", {
        description: `Se descargó el archivo CSV con ${msgs.length} mensajes.`
      });
    } catch {
      toast.error("Error al exportar", {
        description: "No se pudo exportar la conversación."
      });
    }
  };

  // Eliminar conversación
  const handleDeleteConversation = async (conv: ConversationDTO, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar seleccionar la conversación

    if (!confirm(`¿Estás seguro de eliminar la conversación con ${conv.lead?.name || 'este contacto'}?`)) {
      return;
    }

    try {
      await conversationService.delete(conv.id);
      setConversations(prev => prev.filter(c => c.id !== conv.id));
      if (selectedConversation?.id === conv.id) {
        setSelectedConversation(null);
        setMessages([]);
      }
      toast.success("Conversación eliminada");
    } catch {
      toast.error("Error al eliminar", {
        description: "No se pudo eliminar la conversación."
      });
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'ahora';
    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    return date.toLocaleDateString();
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredConversations = conversations.filter((conv) => {
    const matchTab =
      activeTab === "all" ||
      (activeTab === "whatsapp" && conv.channel === "WHATSAPP") ||
      (activeTab === "email" && conv.channel === "EMAIL");

    const searchText = search.toLowerCase();
    const leadName = conv.lead?.name?.toLowerCase() || '';
    const lastMessage = conv.lastMessageText?.toLowerCase() || '';

    const matchSearch =
      leadName.includes(searchText) ||
      lastMessage.includes(searchText);

    return matchTab && matchSearch;
  });

  const handleConversationClick = async (conv: ConversationDTO) => {
    setSelectedConversation(conv);
    setShowMobileChat(true);

    // Mark messages as read and update the unread count
    if (conv.unreadCount > 0) {
      try {
        await conversationService.markAsRead(conv.id);
        // Update the conversation in the list to reflect 0 unread
        setConversations(prev => prev.map(c =>
          c.id === conv.id ? { ...c, unreadCount: 0 } : c
        ));
      } catch (error) {
        console.error('Error marking conversation as read:', error);
      }
    }
  };

  const getLeadStage = (conv: ConversationDTO) => {
    // Por ahora retornamos un valor por defecto, se puede mejorar
    return conv.lead ? 'Lead Activo' : 'Desconocido';
  };

  return (
    <div className="p-4 md:p-8 h-[calc(100vh-60px)] flex flex-col">
      <div className={cn("mb-6", showMobileChat ? "hidden lg:block" : "block")}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold">Mensajes</h1>
            <p className="text-slate-600">Conversaciones en tiempo real a través de WhatsApp y Email.</p>
          </div>
          <div className="flex items-center gap-2">
            {wsConnected ? (
              <div className="flex items-center gap-1 text-emerald-600">
                <Wifi className="h-4 w-4" />
                <span className="text-xs hidden sm:inline">Conectado</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-yellow-600">
                <WifiOff className="h-4 w-4" />
                <span className="text-xs hidden sm:inline">Conectando...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <Card className={cn(
          "lg:col-span-1 flex-col h-full overflow-hidden",
          showMobileChat ? "hidden lg:flex" : "flex"
        )}>
          <CardHeader className="pb-4 px-4 pt-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar conversaciones..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                size="icon"
                className="bg-purple-600 hover:bg-purple-700 shrink-0"
                onClick={() => setShowNewConversationModal(true)}
                title="Nueva conversación"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">Todos</TabsTrigger>
              <TabsTrigger value="whatsapp" className="flex-1">
                <MessageCircle className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="email" className="flex-1">
                <Mail className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <ScrollArea className="flex-1 mt-2 min-h-0">
            <div className="px-4 pb-4 space-y-1">
              {loadingConversations ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No hay conversaciones
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => handleConversationClick(conv)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors w-full overflow-hidden ${selectedConversation?.id === conv.id ? 'bg-purple-50 border border-purple-200' : 'hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback className={selectedConversation?.id === conv.id ? 'bg-purple-600 text-white' : 'bg-slate-200'}>
                          {getInitials(conv.lead?.name || 'Lead')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <p className="text-sm font-medium truncate flex-1">{conv.lead?.name || 'Lead sin nombre'}</p>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-xs text-slate-500">{formatTime(conv.lastMessageAt)}</span>
                            <div onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    className="h-6 w-6 inline-flex items-center justify-center rounded-md hover:bg-slate-200 transition-colors"
                                    aria-label="Opciones de conversación"
                                  >
                                    <MoreVertical className="h-3 w-3" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48" side="bottom">
                                  <DropdownMenuItem onSelect={(e) => {
                                    e.preventDefault();
                                    exportConversationCSV(conv);
                                  }}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Exportar CSV
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onSelect={(e) => {
                                      e.preventDefault();
                                      if (confirm(`¿Estás seguro de eliminar la conversación con ${conv.lead?.name || 'este contacto'}?`)) {
                                        conversationService.delete(conv.id).then(() => {
                                          setConversations(prev => prev.filter(c => c.id !== conv.id));
                                          if (selectedConversation?.id === conv.id) {
                                            setSelectedConversation(null);
                                            setMessages([]);
                                          }
                                          toast.success("Conversación eliminada");
                                        }).catch(() => {
                                          toast.error("Error al eliminar");
                                        });
                                      }
                                    }}
                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar conversación
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                        <p
                          className="text-sm text-slate-600"
                          style={{
                            whiteSpace: 'nowrap',
                            width: 'clamp(100px, 12vw, 200px)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {conv.lastMessageDirection === 'OUTBOUND' && <span className="font-medium">Tú: </span>}
                          {formatMessagePreview(conv.lastMessageText)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {conv.channel === 'WHATSAPP' ? (
                            <MessageCircle className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Mail className="h-3 w-3 text-blue-600" />
                          )}
                          <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal">
                            {getLeadStage(conv)}
                          </Badge>
                          {conv.unreadCount > 0 && (
                            <Badge className="bg-purple-600 text-[10px] h-5 px-1.5 ml-auto">{conv.unreadCount}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* --- PANEL DE CHAT --- */}
        <Card className={cn(
          "lg:col-span-2 flex-col h-full overflow-hidden",
          showMobileChat ? "flex" : "hidden lg:flex"
        )}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b py-3 px-4 md:py-4 md:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden -ml-2"
                      onClick={() => setShowMobileChat(false)}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>

                    <Avatar>
                      <AvatarFallback className="bg-purple-100 text-purple-600">
                        {getInitials(selectedConversation.lead?.name || 'Lead')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{selectedConversation.lead?.name || 'Lead sin nombre'}</CardTitle>
                      <div className="flex items-center gap-2 mt-0.5">
                        {selectedConversation.channel === 'WHATSAPP' ? (
                          <div className="flex items-center gap-1 text-emerald-600">
                            <MessageCircle className="h-3 w-3" />
                            <span className="text-xs">WhatsApp</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-blue-600">
                            <Mail className="h-3 w-3" />
                            <span className="text-xs">Email</span>
                          </div>
                        )}
                        <Separator orientation="vertical" className="h-3" />
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal">
                          {getLeadStage(selectedConversation)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onSelect={() => exportConversationCSV(selectedConversation)}>
                          <Download className="h-4 w-4 mr-2" />
                          Exportar CSV
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => {
                            if (confirm(`¿Estás seguro de eliminar la conversación con ${selectedConversation.lead?.name || 'este contacto'}?`)) {
                              conversationService.delete(selectedConversation.id).then(() => {
                                setConversations(prev => prev.filter(c => c.id !== selectedConversation.id));
                                setSelectedConversation(null);
                                setMessages([]);
                                setShowMobileChat(false);
                                toast.success("Conversación eliminada");
                              }).catch(() => {
                                toast.error("Error al eliminar");
                              });
                            }
                          }}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar conversación
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <ScrollArea className="flex-1 min-h-0 p-2 md:p-4 overflow-x-hidden">
                {loadingMessages && messages.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                  </div>
                ) : selectedConversation.channel === 'EMAIL' ? (
                  /* EMAIL: Gmail-style thread view */
                  <EmailThread
                    messages={messages}
                    leadName={selectedConversation.lead?.name || 'Lead'}
                    userName={user?.name || 'Tú'}
                  />
                ) : (
                  /* WHATSAPP: Chat bubbles */
                  <div className="space-y-4 w-full overflow-hidden">
                    {messages.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        No hay mensajes todavía
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isOwn = message.messageDirection === 'OUTBOUND';
                        return (
                          <div
                            key={message.id}
                            ref={(el) => {
                              if (el) messageRefs.current.set(message.id, el);
                              else messageRefs.current.delete(message.id);
                            }}
                            className={`flex group transition-colors duration-300 rounded-lg ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            {/* Reply button (appears on hover) - positioned based on message direction */}
                            {isOwn && (
                              <button
                                onClick={() => setReplyingTo(message)}
                                className="opacity-0 group-hover:opacity-100 self-center mr-2 p-1 rounded-full hover:bg-slate-200 transition-opacity"
                                title="Responder"
                              >
                                <Reply className="h-4 w-4 text-slate-500" />
                              </button>
                            )}
                            <div className={`max-w-[85%] md:max-w-[70%]`}>
                              {!isOwn && message.senderLead && (
                                <p className="text-xs text-slate-600 mb-1 ml-1">{message.senderLead.name}</p>
                              )}
                              <div
                                className={`p-3 rounded-2xl text-sm break-words ${isOwn
                                  ? 'bg-purple-600 text-white rounded-tr-none'
                                  : 'bg-slate-100 text-slate-900 rounded-tl-none'
                                  }`}
                              >
                                {/* Show quoted message if replying to another message */}
                                {message.replyToMessage && (
                                  <QuotedMessage
                                    message={message.replyToMessage}
                                    isOwn={isOwn}
                                    onClick={() => message.replyToMessageId && scrollToMessage(message.replyToMessageId)}
                                    leadName={selectedConversation.lead?.name}
                                  />
                                )}
                                {message.mediaUrl ? (
                                  <MessageMedia
                                    type={message.mediaType || message.messageType}
                                    url={message.mediaUrl}
                                    caption={message.mediaCaption}
                                    fileName={message.mediaFileName}
                                    isOwn={isOwn}
                                  />
                                ) : (
                                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                                )}
                              </div>
                              <p className={`text-[10px] text-slate-400 mt-1 ${isOwn ? 'text-right mr-1' : 'text-left ml-1'}`}>
                                {formatMessageTime(message.sentAt)}
                              </p>
                            </div>
                            {/* Reply button for incoming messages (on the right) */}
                            {!isOwn && (
                              <button
                                onClick={() => setReplyingTo(message)}
                                className="opacity-0 group-hover:opacity-100 self-center ml-2 p-1 rounded-full hover:bg-slate-200 transition-opacity"
                                title="Responder"
                              >
                                <Reply className="h-4 w-4 text-slate-500" />
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Reply Bar - shows when replying to a message */}
              {replyingTo && selectedConversation.channel !== 'EMAIL' && (
                <div className="border-t bg-slate-50 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Reply className="h-4 w-4 text-purple-600 flex-shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs text-purple-600 font-medium">
                        Respondiendo a {replyingTo.messageDirection === 'INBOUND' ? (selectedConversation.lead?.name || 'Cliente') : 'ti'}
                      </span>
                      <span className="text-xs text-slate-500 truncate">
                        {replyingTo.mediaUrl
                          ? (replyingTo.messageType === 'IMAGE' ? '📷 Imagen'
                            : replyingTo.messageType === 'VIDEO' ? '🎥 Video'
                              : replyingTo.messageType === 'AUDIO' ? '🎵 Audio'
                                : '📎 Archivo')
                          : replyingTo.content}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="p-1 rounded-full hover:bg-slate-200 flex-shrink-0"
                    title="Cancelar respuesta"
                  >
                    <X className="h-4 w-4 text-slate-500" />
                  </button>
                </div>
              )}

              {/* Message Input */}
              <CardContent className="border-t p-3 md:p-4">
                {selectedConversation.channel === 'EMAIL' ? (
                  /* EMAIL: Mostrar EmailComposer con rich text */
                  <EmailComposer
                    onSend={async (subject, htmlContent) => {
                      try {
                        setSendingMessage(true);
                        // Solo mostrar subject en el primer mensaje de la conversación
                        const isFirstMessage = messages.length === 0;
                        await messageService.sendMessage({
                          conversationId: selectedConversation.id,
                          content: htmlContent,
                          subject: isFirstMessage ? subject : undefined,
                        });
                        await loadMessages(selectedConversation.id);
                        await loadConversations();
                        toast.success("Email enviado correctamente");
                      } catch (error: unknown) {
                        const errorMessage = error instanceof Error
                          ? error.message
                          : "No se pudo enviar el email. Intenta nuevamente.";
                        toast.error("Error al enviar email", {
                          description: errorMessage,
                          duration: 6000,
                        });
                      } finally {
                        setSendingMessage(false);
                      }
                    }}
                    sending={sendingMessage}
                    showSubject={messages.length === 0}
                    recipientEmail={selectedConversation.lead?.email}
                    recipientName={selectedConversation.lead?.name}
                  />
                ) : (
                  /* WHATSAPP: Chat input estándar */
                  <>
                    {/* File preview */}
                    {selectedFile && (
                      <div className="flex items-center gap-2 mb-2 p-2 bg-slate-100 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                          <p className="text-xs text-slate-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setSelectedFile(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 100 * 1024 * 1024) {
                              toast.error("El archivo es demasiado grande", {
                                description: "El tamaño máximo permitido es 100 MB"
                              });
                              return;
                            }
                            setSelectedFile(file);
                          }
                        }}
                      />

                      {/* Attach file button - hidden when recording */}
                      {!isRecordingAudio && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingFile}
                        >
                          <Paperclip className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Text input - hidden when recording */}
                      {!isRecordingAudio && (
                        <Input
                          placeholder={selectedFile ? "Añade un mensaje (opcional)..." : "Escribe tu mensaje..."}
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && (messageInput.trim() || selectedFile)) {
                              handleSendMessage();
                            }
                          }}
                          className="flex-1"
                          disabled={sendingMessage || uploadingFile}
                        />
                      )}

                      {/* Audio recorder - shows when recording, otherwise hidden */}
                      {isRecordingAudio ? (
                        <AudioRecorder
                          disabled={sendingMessage || uploadingFile}
                          onRecordingComplete={async (audioBlob) => {
                            try {
                              setSendingMessage(true);

                              // Create file from blob with correct extension based on mime type
                              const mimeType = audioBlob.type || 'audio/ogg';
                              const extension = mimeType.includes('ogg') ? 'ogg' : 'webm';
                              const audioFile = new File(
                                [audioBlob],
                                `audio_${Date.now()}.${extension}`,
                                { type: mimeType }
                              );
                              console.log('📤 Uploading audio:', audioFile.name, 'type:', mimeType);

                              // Upload the audio file
                              const uploadResult = await messageService.uploadMedia(audioFile);

                              // Send the audio message (include reply reference if replying)
                              await messageService.sendMessage({
                                conversationId: selectedConversation!.id,
                                content: '[Audio]',
                                messageType: 'AUDIO',
                                mediaUrl: uploadResult.url,
                                mediaFileName: uploadResult.filename,
                                replyToMessageId: replyingTo?.id, // Include reply reference
                              });

                              // Clear reply state after sending
                              setReplyingTo(null);

                              // Reload messages and conversations
                              await loadMessages(selectedConversation!.id);
                              await loadConversations();

                              toast.success("Audio enviado correctamente");
                            } catch (error: unknown) {
                              const errorMessage = error instanceof Error
                                ? error.message
                                : "No se pudo enviar el audio. Intenta nuevamente.";
                              toast.error("Error al enviar audio", {
                                description: errorMessage,
                                duration: 6000,
                              });
                            } finally {
                              setSendingMessage(false);
                              setIsRecordingAudio(false);
                            }
                          }}
                          onCancel={() => setIsRecordingAudio(false)}
                        />
                      ) : (
                        /* Show Mic or Send button based on input state */
                        (messageInput.trim() || selectedFile) ? (
                          /* Has text or file - show Send button */
                          <Button
                            className="bg-purple-600 hover:bg-purple-700 shrink-0"
                            onClick={handleSendMessage}
                            disabled={sendingMessage || uploadingFile}
                          >
                            {(sendingMessage || uploadingFile) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        ) : (
                          /* Empty input - show Mic button to start recording */
                          <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                            onClick={() => setIsRecordingAudio(true)}
                            disabled={sendingMessage || uploadingFile}
                            title="Grabar audio"
                          >
                            <Mic className="h-4 w-4" />
                          </Button>
                        )
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              Selecciona una conversación para ver los mensajes
            </div>
          )}
        </Card>
      </div>

      {/* Modal para nueva conversación */}
      <NewConversationModal
        open={showNewConversationModal}
        onOpenChange={setShowNewConversationModal}
        existingConversations={conversations}
        onConversationCreated={(conversation) => {
          // Agregar la nueva conversación al inicio de la lista
          setConversations(prev => [conversation, ...prev]);
          // Seleccionar la nueva conversación
          setSelectedConversation(conversation);
          // Mostrar el chat en móvil
          setShowMobileChat(true);
        }}
      />
    </div >
  );
}