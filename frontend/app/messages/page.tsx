"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Send, Paperclip, MessageCircle, Mail, MoreVertical, ArrowLeft } from "lucide-react"; 
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { conversationService, ConversationDTO } from "@/services/conversation.service";
import { messageService, MessageDTO } from "@/services/message.service";
import { toast } from "sonner";

// Helper para formatear fechas
const formatTimeAgo = (dateString: string | null): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "hace un momento";
  if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} hora${Math.floor(diffInSeconds / 3600) > 1 ? 's' : ''}`;
  if (diffInSeconds < 604800) return `hace ${Math.floor(diffInSeconds / 86400)} día${Math.floor(diffInSeconds / 86400) > 1 ? 's' : ''}`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

const formatMessageTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

// Mapear stage del backend al frontend
const mapStageToFrontend = (stage: string): string => {
  const mapping: Record<string, string> = {
    "ACTIVE_LEAD": "Lead Activo",
    "FOLLOW_UP": "Seguimiento",
    "CLIENT": "Cliente",
    "LOST": "Perdido",
  };
  return mapping[stage] || stage;
};

// Mapear channel del backend al frontend
const mapChannelToFrontend = (channel: string): string => {
  const mapping: Record<string, string> = {
    "WHATSAPP": "whatsapp",
    "EMAIL": "email",
  };
  return mapping[channel] || channel.toLowerCase();
};

export default function Message() {
  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationDTO | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Cargar conversaciones al montar
  useEffect(() => {
    loadConversations();
  }, []);

  // Cargar mensajes cuando se selecciona una conversación
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const data = await conversationService.getAll();
      setConversations(data);
      if (data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0]);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast.error(error instanceof Error ? error.message : "Error al cargar las conversaciones");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: number) => {
    try {
      const data = await messageService.getByConversationId(conversationId);
      setMessages(data);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error(error instanceof Error ? error.message : "Error al cargar los mensajes");
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || isSending) return;

    try {
      setIsSending(true);
      await messageService.create({
        conversationId: selectedConversation.id,
        senderType: "USER",
        messageDirection: "OUTBOUND",
        messageType: "TEXT",
        content: messageInput.trim(),
      });
      
      setMessageInput('');
      // Recargar mensajes y conversaciones
      await loadMessages(selectedConversation.id);
      await loadConversations();
      toast.success("Mensaje enviado");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error instanceof Error ? error.message : "Error al enviar el mensaje");
    } finally {
      setIsSending(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const filteredConversations = conversations.filter((conv) => {
    const matchTab =
      activeTab === "all" ||
      (activeTab === "whatsapp" && mapChannelToFrontend(conv.lead?.channel || "") === "whatsapp") ||
      (activeTab === "email" && mapChannelToFrontend(conv.lead?.channel || "") === "email");

    const searchText = search.toLowerCase();
    const leadName = conv.lead?.name || "";
    const lastMessage = conv.lastMessageText || "";
    const stage = mapStageToFrontend(conv.lead?.stage || "");

    const matchSearch =
      leadName.toLowerCase().includes(searchText) ||
      lastMessage.toLowerCase().includes(searchText) ||
      stage.toLowerCase().includes(searchText);

    return matchTab && matchSearch;
  });

  const handleConversationClick = (conv: ConversationDTO) => {
    setSelectedConversation(conv);
    setShowMobileChat(true);
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 h-[calc(100vh-60px)] flex items-center justify-center">
        <p className="text-slate-600">Cargando conversaciones...</p>
      </div>
    );
  }

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
              {filteredConversations.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No hay conversaciones</p>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = selectedConversation?.id === conv.id;
                  const leadName = conv.lead?.name || "Sin nombre";
                  const channel = mapChannelToFrontend(conv.lead?.channel || "");
                  const stage = mapStageToFrontend(conv.lead?.stage || "");
                  
                  return (
                    <div
                      key={conv.id}
                      onClick={() => handleConversationClick(conv)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'bg-purple-50 border border-purple-200' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarFallback className={isSelected ? 'bg-purple-600 text-white' : 'bg-slate-200'}>
                            {getInitials(leadName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium truncate">{leadName}</p>
                            <span className="text-xs text-slate-500">
                              {formatTimeAgo(conv.lastMessageAt)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 truncate">
                            {conv.lastMessageText || "Sin mensajes"}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {channel === 'whatsapp' ? (
                              <MessageCircle className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Mail className="h-3 w-3 text-blue-600" />
                            )}
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal">
                              {stage}
                            </Badge>
                            {conv.unreadCount > 0 && (
                              <Badge className="bg-purple-600 text-[10px] h-5 px-1.5 ml-auto">
                                {conv.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </Card>

        <Card className={cn(
            "lg:col-span-2 flex-col h-full",
            showMobileChat ? "flex" : "hidden lg:flex"
        )}>
          {selectedConversation ? (
            <>
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
                        {getInitials(selectedConversation.lead?.name || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">
                        {selectedConversation.lead?.name || "Sin nombre"}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-0.5">
                        {mapChannelToFrontend(selectedConversation.lead?.channel || "") === 'whatsapp' ? (
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
                          {mapStageToFrontend(selectedConversation.lead?.stage || "")}
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

              <ScrollArea className="flex-1 p-4 md:p-6">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8">No hay mensajes aún</p>
                  ) : (
                    messages.map((message) => {
                      const isOwn = message.messageDirection === "OUTBOUND" && message.senderType === "USER";
                      const senderName = isOwn ? "Tú" : (selectedConversation.lead?.name || "Usuario");
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[85%] md:max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                            {!isOwn && (
                              <p className="text-xs text-slate-600 mb-1 ml-1">{senderName}</p>
                            )}
                            <div
                              className={`p-3 rounded-2xl text-sm ${
                                isOwn
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
                </div>
              </ScrollArea>

              <CardContent className="border-t p-3 md:p-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="shrink-0">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Type your message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1"
                    disabled={isSending}
                  />
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700 shrink-0"
                    onClick={handleSendMessage}
                    disabled={isSending || !messageInput.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>         
              </CardContent>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-500">Selecciona una conversación</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
