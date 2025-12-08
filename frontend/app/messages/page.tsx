"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Send, Paperclip, MessageCircle, Mail, MoreVertical, ArrowLeft, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { conversationService, ConversationDTO } from "@/services/conversation.service";
import { messageService, MessageDTO } from "@/services/message.service";

export default function Message() {
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

  // Ref para scroll automático
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar conversaciones al montar
  useEffect(() => {
    loadConversations();

    // Polling cada 10 segundos para actualizar conversaciones
    const interval = setInterval(() => {
      loadConversations();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Cargar mensajes cuando cambia la conversación seleccionada
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);

      // Polling para mensajes cada 5 segundos
      const interval = setInterval(() => {
        loadMessages(selectedConversation.id);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [selectedConversation?.id]);

  // Scroll automático al final de los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const data = await conversationService.getAll();
      setConversations(data);

      // Si no hay conversación seleccionada y hay conversaciones, seleccionar la primera
      if (!selectedConversation && data.length > 0) {
        setSelectedConversation(data[0]);
      }
    } catch (error) {
      console.error("Error cargando conversaciones:", error);
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
      console.error("Error cargando mensajes:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || sendingMessage) return;

    try {
      setSendingMessage(true);
      await messageService.sendMessage({
        conversationId: selectedConversation.id,
        content: messageInput.trim(),
      });
      setMessageInput('');
      // Recargar mensajes después de enviar
      await loadMessages(selectedConversation.id);
      // Actualizar lista de conversaciones para reflejar último mensaje
      await loadConversations();
    } catch (error) {
      console.error("Error enviando mensaje:", error);
    } finally {
      setSendingMessage(false);
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

  const handleConversationClick = (conv: ConversationDTO) => {
    setSelectedConversation(conv);
    setShowMobileChat(true);
  };

  const getLeadStage = (conv: ConversationDTO) => {
    // Por ahora retornamos un valor por defecto, se puede mejorar
    return conv.lead ? 'Lead Activo' : 'Desconocido';
  };

  return (
    <div className="p-4 md:p-8 h-[calc(100vh-60px)] flex flex-col">
      <div className={cn("mb-6", showMobileChat ? "hidden lg:block" : "block")}>
        <h1 className="mb-2 text-2xl font-bold">Mensajes</h1>
        <p className="text-slate-600">Conversaciones en tiempo real a través de WhatsApp y Email.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <Card className={cn(
          "lg:col-span-1 flex-col h-full",
          showMobileChat ? "hidden lg:flex" : "flex"
        )}>
          <CardHeader className="pb-4 px-4 pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar conversaciones..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
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
          <ScrollArea className="flex-1 mt-2">
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
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedConversation?.id === conv.id ? 'bg-purple-50 border border-purple-200' : 'hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback className={selectedConversation?.id === conv.id ? 'bg-purple-600 text-white' : 'bg-slate-200'}>
                          {getInitials(conv.lead?.name || 'Lead')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium truncate">{conv.lead?.name || 'Lead sin nombre'}</p>
                          <span className="text-xs text-slate-500">{formatTime(conv.lastMessageAt)}</span>
                        </div>
                        <p className="text-sm text-slate-600 truncate">{conv.lastMessageText || 'Sin mensajes'}</p>
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
          "lg:col-span-2 flex-col h-full",
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
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4 md:p-6">
                <div className="space-y-4">
                  {loadingMessages && messages.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      No hay mensajes todavía
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwn = message.messageDirection === 'OUTBOUND';
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[85%] md:max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                            {!isOwn && message.senderLead && (
                              <p className="text-xs text-slate-600 mb-1 ml-1">{message.senderLead.name}</p>
                            )}
                            <div
                              className={`p-3 rounded-2xl text-sm ${isOwn
                                  ? 'bg-purple-600 text-white rounded-tr-none'
                                  : 'bg-slate-100 text-slate-900 rounded-tl-none'
                                }`}
                            >
                              <p>{message.content}</p>
                            </div>
                            <p className={`text-[10px] text-slate-400 mt-1 ${isOwn ? 'text-right mr-1' : 'text-left ml-1'}`}>
                              {formatMessageTime(message.sentAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <CardContent className="border-t p-3 md:p-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="shrink-0">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Escribe tu mensaje..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                    className="flex-1"
                    disabled={sendingMessage}
                  />
                  <Button
                    className="bg-purple-600 hover:bg-purple-700 shrink-0"
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !messageInput.trim()}
                  >
                    {sendingMessage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              Selecciona una conversación para ver los mensajes
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}