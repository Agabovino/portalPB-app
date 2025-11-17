// ============================================
// SISTEMA DE BUSCA AVANÇADA
// ============================================

// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import NoticiaModel from '@/models/Noticia';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('q') || '';
    const categoria = searchParams.get('categoria');
    const sentimento = searchParams.get('sentimento');
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');
    const limit = parseInt(searchParams.get('limit') || '20');

    const filtro: any = {};

    // Busca textual
    if (query) {
      filtro.$text = { $search: query };
    }

    if (categoria) {
      filtro.categoria = categoria;
    }

    if (sentimento) {
      filtro.sentimento = sentimento;
    }

    if (dataInicio || dataFim) {
      filtro.dataPublicacao = {};
      if (dataInicio) filtro.dataPublicacao.$gte = new Date(dataInicio);
      if (dataFim) filtro.dataPublicacao.$lte = new Date(dataFim);
    }

    const noticias = await NoticiaModel.find(filtro)
      .sort({ dataPublicacao: -1 })
      .limit(limit);

    return NextResponse.json({
      sucesso: true,
      total: noticias.length,
      noticias,
    });
  } catch (error: any) {
    console.error('Erro na busca:', error);
    return NextResponse.json(
      { sucesso: false, erro: error.message },
      { status: 500 }
    );
  }
}
