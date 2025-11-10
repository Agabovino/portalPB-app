// ============================================
// SERVER-SENT EVENTS (SSE) - TEMPO REAL
// ============================================

// src/app/api/events/route.ts
import { NextRequest } from 'next/server';
import monitor from '@/lib/monitor';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Configurar SSE
      const send = (data: any) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      // Enviar mensagem inicial
      send({ type: 'connected', message: 'Conectado ao servidor de eventos' });

      // Inscrever-se nas atualizações do monitor
      const unsubscribe = monitor.subscribe((data) => {
        send(data);
      });

      // Heartbeat a cada 30 segundos
      const heartbeat = setInterval(() => {
        send({ type: 'heartbeat', timestamp: Date.now() });
      }, 30000);

      // Cleanup quando a conexão fechar
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
