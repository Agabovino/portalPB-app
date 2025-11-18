// src/app/api/refatorar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import NoticiaModel from '@/models/Noticia';
import { OpenAIRefactor } from '@/lib/openai';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { noticiaIds } = body;

    if (!noticiaIds || !Array.isArray(noticiaIds) || noticiaIds.length === 0) {
      return NextResponse.json(
        { sucesso: false, erro: 'IDs das notícias são obrigatórios' },
        { status: 400 }
      );
    }

    const openai = new OpenAIRefactor();
    const erros: string[] = [];
    let processadas = 0;

    for (const id of noticiaIds) {
      try {
        const noticia = await NoticiaModel.findById(id);
        
        if (!noticia) {
          erros.push(`Notícia ${id} não encontrada`);
          continue;
        }

        console.log(`[Refactor API] Refatorando notícia ID: ${id}`);
        console.log(`[Refactor API] Título original: ${noticia.titulo}`);
        console.log(`[Refactor API] Conteúdo bruto (primeiros 200 chars): ${noticia.conteudoBruto?.substring(0, 200)}...`);

        // Refatorar com OpenAI
        const textoRefatorado = await openai.refatorarNoticia(
          noticia.titulo,
          noticia.conteudoBruto
        );

        console.log(`[Refactor API] Texto refatorado (primeiros 200 chars): ${textoRefatorado?.substring(0, 200)}...`);

        // Atualizar no banco
        await NoticiaModel.findByIdAndUpdate(id, {
          textoRefatorado,
          refatorada: true,
        });
        console.log(`[Refactor API] Notícia ID ${id} atualizada no banco.`);

        processadas++;
      } catch (error: any) {
        console.error(`Erro ao refatorar notícia ${id}:`, error);
        erros.push(`Erro em ${id}: ${error.message}`);
      }
    }

    return NextResponse.json({
      sucesso: true,
      processadas,
      erros,
      mensagem: `${processadas} notícias refatoradas com sucesso`,
    });
  } catch (error: any) {
    console.error('Erro ao refatorar notícias:', error);
    return NextResponse.json(
      { sucesso: false, erro: error.message },
      { status: 500 }
    );
  }
}
