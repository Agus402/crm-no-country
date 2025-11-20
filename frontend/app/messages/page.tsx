"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Send, Paperclip, MessageCircle, Mail, Tag, MoreVertical } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  const filteredConversations = conversations.filter(conv => {
    if (activeTab === 'all') return true;
    if (activeTab === 'whatsapp') return conv.channel === 'whatsapp';
    if (activeTab === 'email') return conv.channel === 'email';
    return true;
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="mb-2">Mensajes</h1>
        <p className="text-slate-600">Conversaciones en tiempo real a través de WhatsApp y Email.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
        {/* Conversations List */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader className="pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Buscar conversaciones..." className="pl-10" />
            </div>
          </CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6">
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
          <ScrollArea className="flex-1">
            <div className="px-4 pb-4 space-y-1">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
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
                        <p className="text-sm truncate">{conv.name}</p>
                        <span className="text-xs text-slate-500">{conv.time}</span>
                      </div>
                      <p className="text-sm text-slate-600 truncate">{conv.lastMessage}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {conv.channel === 'whatsapp' ? (
                          <MessageCircle className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Mail className="h-3 w-3 text-blue-600" />
                        )}
                        <Badge variant="outline" className="text-xs">
                          {conv.stage}
                        </Badge>
                        {conv.unread > 0 && (
                          <Badge className="bg-purple-600 text-xs ml-auto">{conv.unread}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat Panel */}
        <Card className="lg:col-span-2 flex flex-col">
          {/* Chat Header */}
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-purple-100 text-purple-600">
                    {getInitials(selectedConversation.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{selectedConversation.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
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
                    <Badge variant="outline" className="text-xs">
                      {selectedConversation.stage}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Tag className="h-4 w-4 mr-1" />
                  Agregar Etiqueta
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${message.isOwn ? 'order-2' : 'order-1'}`}>
                    {!message.isOwn && (
                      <p className="text-xs text-slate-600 mb-1">{message.sender}</p>
                    )}
                    <div
                      className={`p-3 rounded-lg ${
                        message.isOwn
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{message.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <CardContent className="border-t pt-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
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
              />
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-slate-100">Respuesta Rápida: Precio</Badge>
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-slate-100">Respuesta Rápida: Demo</Badge>
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-slate-100">Respuesta Rápida: Seguimiento</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
