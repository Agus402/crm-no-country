"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Send, Paperclip, MessageCircle, Mail, Tag, MoreVertical, ArrowLeft } from "lucide-react"; 
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils"; 

const conversations = [
  { id: 1, name: 'Sarah Chen', lastMessage: 'Interesada en el plan Enterprise', time: 'hace 5 min', unread: 2, channel: 'whatsapp', stage: 'Lead Activo' },
  { id: 2, name: 'Marcus Brown', lastMessage: '¡Gracias por la demo!', time: 'hace 12 min', unread: 0, channel: 'email', stage: 'Seguimiento' },
  { id: 3, name: 'Jessica Park', lastMessage: 'Envié la confirmación de pago', time: 'hace 1 hora', unread: 1, channel: 'whatsapp', stage: 'Cliente' },
  { id: 4, name: 'David Liu', lastMessage: '¿Cuándo podemos agendar?', time: 'hace 2 horas', unread: 0, channel: 'email', stage: 'Lead Activo' },
  { id: 5, name: 'Thomas Anderson', lastMessage: 'Con ganas de nuestra reunión', time: 'hace 3 horas', unread: 3, channel: 'whatsapp', stage: 'Lead Activo' },
];

const messages = [
  { id: 1, sender: 'Sarah Chen', content: '¡Hola! Vi su producto y estoy muy interesada en el plan Enterprise.', time: '10:23 AM', isOwn: false },
  { id: 2, sender: 'Tú', content: '¡Hola Sarah! Gracias por contactarte. Con gusto te ayudo con el plan Enterprise. ¿En qué funciones específicas estás interesada?', time: '10:25 AM', isOwn: true },
  { id: 3, sender: 'Sarah Chen', content: 'Necesitamos las analíticas avanzadas y la opción de marca blanca. ¿Cuántos usuarios podemos tener?', time: '10:27 AM', isOwn: false },
  { id: 4, sender: 'Tú', content: 'El plan Enterprise soporta usuarios ilimitados e incluye todas las funciones premium. Puedo agendar una demo para mostrarte el panel de analíticas y las opciones de personalización de marca blanca.', time: '10:30 AM', isOwn: true },
  { id: 5, sender: 'Sarah Chen', content: '¡Perfecto! ¿Cuándo estás disponible esta semana?', time: '10:32 AM', isOwn: false },
];

export default function Message() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [messageInput, setMessageInput] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState("");
  
  // ESTADO : Controla si estamos viendo el chat en móvil
  const [showMobileChat, setShowMobileChat] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

 const filteredConversations = conversations.filter((conv) => {
  const matchTab =
    activeTab === "all" ||
    (activeTab === "whatsapp" && conv.channel === "whatsapp") ||
    (activeTab === "email" && conv.channel === "email");

  const searchText = search.toLowerCase();

  const matchSearch =
    conv.name.toLowerCase().includes(searchText) ||
    conv.lastMessage.toLowerCase().includes(searchText) ||
    conv.stage.toLowerCase().includes(searchText);

  return matchTab && matchSearch;
});

  // Función al hacer click en una conversación
  const handleConversationClick = (conv: any) => {
    setSelectedConversation(conv);
    setShowMobileChat(true); 
  };

  return (
    <div className="p-4 md:p-8 h-[calc(100vh-60px)] flex flex-col"> 
      {/* Título solo visible si no estamos en chat móvil o si estamos en desktop */}
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
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleConversationClick(conv)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation.id === conv.id ? 'bg-purple-50 border border-purple-200' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback className={selectedConversation.id === conv.id ? 'bg-purple-600 text-white' : 'bg-slate-200'}>
                        {getInitials(conv.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium truncate">{conv.name}</p>
                        <span className="text-xs text-slate-500">{conv.time}</span>
                      </div>
                      <p className="text-sm text-slate-600 truncate">{conv.lastMessage}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {conv.channel === 'whatsapp' ? (
                          <MessageCircle className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Mail className="h-3 w-3 text-blue-600" />
                        )}
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal">
                          {conv.stage}
                        </Badge>
                        {conv.unread > 0 && (
                          <Badge className="bg-purple-600 text-[10px] h-5 px-1.5 ml-auto">{conv.unread}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* --- PANEL DE CHAT --- */}
        {/* Lógica Responsive:
            - showMobileChat ? "flex" : "hidden" -> Si estamos viendo chat en móvil, muéstralo.
            - lg:flex -> En desktop SIEMPRE muéstralo.
        */}
        <Card className={cn(
            "lg:col-span-2 flex-col h-full",
            showMobileChat ? "flex" : "hidden lg:flex"
        )}>
          {/* Chat Header */}
          <CardHeader className="border-b py-3 px-4 md:py-4 md:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* BOTÓN VOLVER (Solo Móvil) */}
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
                    {getInitials(selectedConversation.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{selectedConversation.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-0.5">
                    {selectedConversation.channel === 'whatsapp' ? (
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
                      {selectedConversation.stage}
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
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] md:max-w-[70%] ${message.isOwn ? 'order-2' : 'order-1'}`}>
                    {!message.isOwn && (
                      <p className="text-xs text-slate-600 mb-1 ml-1">{message.sender}</p>
                    )}
                    <div
                      className={`p-3 rounded-2xl text-sm ${
                        message.isOwn
                          ? 'bg-purple-600 text-white rounded-tr-none'
                          : 'bg-slate-100 text-slate-900 rounded-tl-none'
                      }`}
                    >
                      <p>{message.content}</p>
                    </div>
                    <p className={`text-[10px] text-slate-400 mt-1 ${message.isOwn ? 'text-right mr-1' : 'text-left ml-1'}`}>
                        {message.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Message Input */}
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
                  if (e.key === 'Enter') {
                    setMessageInput('');
                  }
                }}
                className="flex-1"
              />
              <Button className="bg-purple-600 hover:bg-purple-700 shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>         
          </CardContent>
        </Card>
      </div>
    </div>
  );
}