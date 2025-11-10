// src/app/api/noticias/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import NoticiaModel from '@/models/Noticia';
import URLModel from '@/models/URL'; // Importar URLModel

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    
    const categoria = searchParams.get('categoria');
    const refatorada = searchParams.get('refatorada');
    const selecionada = searchParams.get('selecionada');
    const filterByActiveUrls = searchParams.get('filterByActiveUrls'); // Novo parâmetro
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    const filtro: any = {};
    
    if (categoria) filtro.categoria = categoria;
    if (refatorada !== null) filtro.refatorada = refatorada === 'true';
    if (selecionada !== null) filtro.selecionada = selecionada === 'true';

    // Filtrar por URLs ativas se o parâmetro for true
    if (filterByActiveUrls === 'true') {
      const activeUrls = await URLModel.find({ ativo: true, pausado: false }).select('url');
      const activeUrlStrings = activeUrls.map(urlDoc => urlDoc.url);
      filtro.urlMonitorada = { $in: activeUrlStrings };
    }

    const noticias = await NoticiaModel.find(filtro)
      .sort({ dataPublicacao: -1 })
      .limit(limit)
      .skip(skip);

    const total = await NoticiaModel.countDocuments(filtro);

    return NextResponse.json({
      sucesso: true,
      noticias,
      total,
      limit,
      skip,
    });
  } catch (error: any) {
    console.error('Erro ao buscar notícias:', error);
    return NextResponse.json(
      { sucesso: false, erro: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar seleção
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { noticiaId, selecionada } = body;

    if (!noticiaId) {
      return NextResponse.json(
        { sucesso: false, erro: 'ID da notícia é obrigatório' },
        { status: 400 }
      );
    }

    await NoticiaModel.findByIdAndUpdate(noticiaId, { selecionada });

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Notícia atualizada',
    });
  } catch (error: any) {
    console.error('Erro ao atualizar notícia:', error);
    return NextResponse.json(
      { sucesso: false, erro: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Excluir notícia
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { sucesso: false, erro: 'ID da notícia é obrigatório' },
        { status: 400 }
      );
    }

    const result = await NoticiaModel.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json(
        { sucesso: false, erro: 'Notícia não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Notícia excluída com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao excluir notícia:', error);
    return NextResponse.json(
      { sucesso: false, erro: error.message },
      { status: 500 }
    );
  }
}