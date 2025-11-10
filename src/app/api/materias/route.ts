// src/app/api/materias/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import NoticiaModel from '@/models/Noticia';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    
    const categoria = searchParams.get('categoria');
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = parseInt(searchParams.get('skip') || '0');

    const filtro: any = { refatorada: true };
    
    if (categoria) filtro.categoria = categoria;
    
    if (dataInicio || dataFim) {
      filtro.dataPublicacao = {};
      if (dataInicio) filtro.dataPublicacao.$gte = new Date(dataInicio);
      if (dataFim) filtro.dataPublicacao.$lte = new Date(dataFim);
    }

    const materias = await NoticiaModel.find(filtro)
      .select('titulo url dataPublicacao categoria textoRefatorado imagemUrl')
      .sort({ dataPublicacao: -1 })
      .limit(limit)
      .skip(skip);

    const total = await NoticiaModel.countDocuments(filtro);

    const materiasFormatadas = materias.map(m => ({
      id: m._id,
      titulo: m.titulo,
      url: m.url,
      dataPublicacao: m.dataPublicacao,
      categoria: m.categoria,
      textoRefatorado: m.textoRefatorado,
      imagemUrl: m.imagemUrl,
    }));

    return NextResponse.json({
      sucesso: true,
      materias: materiasFormatadas,
      total,
      limit,
      skip,
    });
  } catch (error: any) {
    console.error('Erro ao buscar matérias:', error);
    return NextResponse.json(
      { sucesso: false, erro: error.message },
      { status: 500 }
    );
  }
}
