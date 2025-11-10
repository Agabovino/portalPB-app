'use client';

import { useEffect, useState } from 'react';

interface SSEMessage {
  type: string;
  [key: string]: any;
}

export function useSSE(url: string = '/api/events') {
  const [messages, setMessages] = useState<SSEMessage[]>([]);
  const [lastMessage, setLastMessage] = useState<SSEMessage | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
      console.log('✅ SSE conectado');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        setMessages((prev) => [...prev, data]);
      } catch (error) {
        console.error('Erro ao parsear mensagem SSE:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Erro no SSE:', error);
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [url]);

  return { messages, lastMessage, isConnected };
}