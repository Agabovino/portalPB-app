// src/app/api/urls/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import URLModel from '@/models/URL';
import monitor from '@/lib/monitor';

// GET - Listar todas as URLs
export async function GET() {
  try {
    await dbConnect();
    const urls = await URLModel.find().sort({ criadaEm: -1 });
    
    return NextResponse.json({ 
      sucesso: true, 
      urls 
    });
  } catch (error: any) {
    console.error('Erro ao buscar URLs:', error);
    return NextResponse.json(
      { sucesso: false, erro: error.message },
      { status: 500 }
    );
  }
}

// POST - Adicionar nova URL
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const { url, categoria, dataInicio, dataFim } = body;

    if (!url || !categoria) {
      return NextResponse.json(
        { sucesso: false, erro: 'URL e categoria são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se URL já existe
    const urlExistente = await URLModel.findOne({ url });
    if (urlExistente) {
      return NextResponse.json(
        { sucesso: false, erro: 'Esta URL já está sendo monitorada' },
        { status: 400 }
      );
    }

    const novaURL = new URLModel({
      url,
      categoria,
      dataInicio: dataInicio ? new Date(dataInicio) : undefined,
      dataFim: dataFim ? new Date(dataFim) : undefined,
      ativo: true,
      pausado: false,
    });

    await novaURL.save();

    // Iniciar monitoramento automaticamente
    await monitor.startMonitoring(novaURL._id.toString());

    return NextResponse.json({
      sucesso: true,
      url: novaURL,
      mensagem: 'URL adicionada e monitoramento iniciado',
    });
  } catch (error: any) {
    console.error('Erro ao adicionar URL:', error);
    return NextResponse.json(
      { sucesso: false, erro: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remover URL
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const urlId = searchParams.get('id');

    if (!urlId) {
      return NextResponse.json(
        { sucesso: false, erro: 'ID da URL é obrigatório' },
        { status: 400 }
      );
    }

    // Parar monitoramento
    await monitor.stopMonitoring(urlId);

    // Remover do banco
    await URLModel.findByIdAndDelete(urlId);

    return NextResponse.json({
      sucesso: true,
      mensagem: 'URL removida com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao remover URL:', error);
    return NextResponse.json(
      { sucesso: false, erro: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Pausar/Reativar monitoramento
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { urlId, pausado } = body;

    if (!urlId) {
      return NextResponse.json(
        { sucesso: false, erro: 'ID da URL é obrigatório' },
        { status: 400 }
      );
    }

    if (pausado) {
      await monitor.pauseMonitoring(urlId);
    } else {
      await monitor.resumeMonitoring(urlId);
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: pausado ? 'Monitoramento pausado' : 'Monitoramento reativado',
    });
  } catch (error: any) {
    console.error('Erro ao atualizar status:', error);
    return NextResponse.json(
      { sucesso: false, erro: error.message },
      { status: 500 }
    );
  }
}
