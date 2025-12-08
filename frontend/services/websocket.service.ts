import { Client, StompSubscription, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8080';

export interface WebSocketMessage {
    type: 'NEW_MESSAGE' | 'MESSAGE_SENT' | 'CONVERSATION_UPDATED';
    conversationId: number;
    message?: unknown;
    conversation?: unknown;
}

class WebSocketService {
    private client: Client | null = null;
    private subscriptions: Map<string, StompSubscription> = new Map();
    private connected: boolean = false;
    private onConnectCallbacks: (() => void)[] = [];

    connect(onConnect?: () => void): void {
        if (this.connected && this.client?.connected) {
            onConnect?.();
            return;
        }

        if (onConnect) {
            this.onConnectCallbacks.push(onConnect);
        }

        if (this.client) {
            return; // Ya hay una conexión en progreso
        }

        this.client = new Client({
            webSocketFactory: () => new SockJS(`${WS_URL}/ws`),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            debug: (str) => {
                console.log('[STOMP]', str);
            },
            onConnect: () => {
                console.log('✅ WebSocket conectado');
                this.connected = true;
                this.onConnectCallbacks.forEach(cb => cb());
                this.onConnectCallbacks = [];
            },
            onStompError: (frame) => {
                console.error('❌ Error STOMP:', frame.headers['message']);
            },
            onDisconnect: () => {
                console.log('🔌 WebSocket desconectado');
                this.connected = false;
            },
            onWebSocketClose: () => {
                console.log('🔌 WebSocket cerrado');
                this.connected = false;
            }
        });

        this.client.activate();
    }

    subscribe(topic: string, callback: (message: WebSocketMessage) => void): string {
        if (!this.client || !this.connected) {
            console.warn('WebSocket no conectado, intentando conectar...');
            this.connect(() => {
                this.subscribe(topic, callback);
            });
            return '';
        }

        // Evitar suscripciones duplicadas
        const existingId = Array.from(this.subscriptions.entries())
            .find(([, sub]) => sub.id === topic)?.[0];
        if (existingId) {
            return existingId;
        }

        const subscription = this.client.subscribe(topic, (message: IMessage) => {
            try {
                const parsed = JSON.parse(message.body) as WebSocketMessage;
                callback(parsed);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        });

        const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        this.subscriptions.set(id, subscription);
        console.log(`📡 Suscrito a ${topic} (ID: ${id})`);
        return id;
    }

    unsubscribe(id: string): void {
        const subscription = this.subscriptions.get(id);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(id);
            console.log(`🔕 Desuscrito (ID: ${id})`);
        }
    }

    unsubscribeAll(): void {
        this.subscriptions.forEach((sub, id) => {
            sub.unsubscribe();
            console.log(`🔕 Desuscrito (ID: ${id})`);
        });
        this.subscriptions.clear();
    }

    disconnect(): void {
        this.unsubscribeAll();
        if (this.client) {
            this.client.deactivate();
            this.client = null;
            this.connected = false;
            console.log('👋 WebSocket desconectado manualmente');
        }
    }

    isConnected(): boolean {
        return this.connected && !!this.client?.connected;
    }
}

// Singleton
export const websocketService = new WebSocketService();
