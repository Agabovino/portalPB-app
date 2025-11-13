// src/app/api/monitor/route.ts
import { NextRequest, NextResponse } from 'next/server';
import monitor from '@/lib/monitor';

export async function GET() {
  try {
    const status = await monitor.getMonitoringStatus();
    
    return NextResponse.json({
      sucesso: true,
      status,
    });
  } catch (error: any) {
    console.error('Erro ao buscar status:', error);
    return NextResponse.json(
      { sucesso: false, erro: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { urlId } = await req.json();

    if (!urlId) {
      return NextResponse.json(
        { sucesso: false, erro: 'O ID da URL é obrigatório' },
        { status: 400 }
      );
    }

    // Nao espere a conclusao
    monitor.collectNews(urlId);

    return NextResponse.json({
      sucesso: true,
      mensagem: 'A coleta de notícias foi iniciada em segundo plano.',
    });
  } catch (error: any) {
    console.error('Erro ao iniciar coleta de notícias:', error);
    return NextResponse.json(
      { sucesso: false, erro: error.message },
      { status: 500 }
    );
  }
}
