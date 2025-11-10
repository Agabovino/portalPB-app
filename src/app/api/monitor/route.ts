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
