// ============================================
// SISTEMA DE EXPORT (CSV, JSON, PDF)
// ============================================

// src/app/api/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import NoticiaModel from '../../../models/Noticia';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    
    const formato = searchParams.get('formato') || 'json';
    const categoria = searchParams.get('categoria');
    const refatorada = searchParams.get('refatorada');

    const filtro: any = {};
    if (categoria) filtro.categoria = categoria;
    if (refatorada) filtro.refatorada = refatorada === 'true';

    const noticias = await NoticiaModel.find(filtro)
      .sort({ dataPublicacao: -1 })
      .limit(1000);

    switch (formato) {
      case 'csv':
        return exportCSV(noticias);
      case 'json':
        return exportJSON(noticias);
      case 'txt':
        return exportTXT(noticias);
      default:
        return NextResponse.json(
          { sucesso: false, erro: 'Formato não suportado' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Erro ao exportar:', error);
    return NextResponse.json(
      { sucesso: false, erro: error.message },
      { status: 500 }
    );
  }
}

function exportCSV(noticias: any[]) {
  const headers = ['ID', 'Título', 'URL', 'Categoria', 'Data Publicação', 'Refatorada', 'Texto Refatorado'];
  const rows = noticias.map(n => [
    n._id,
    `"${n.titulo.replace(/"/g, '""')}"`,
    n.url,
    n.categoria,
    new Date(n.dataPublicacao).toLocaleDateString('pt-BR'),
    n.refatorada ? 'Sim' : 'Não',
    n.textoRefatorado ? `"${n.textoRefatorado.substring(0, 500).replace(/"/g, '""')}..."` : '',
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="noticias_${Date.now()}.csv"`,
    },
  });
}

function exportJSON(noticias: any[]) {
  const data = noticias.map(n => ({
    id: n._id,
    titulo: n.titulo,
    url: n.url,
    categoria: n.categoria,
    dataPublicacao: n.dataPublicacao,
    imagemUrl: n.imagemUrl,
    resumo: n.resumo,
    refatorada: n.refatorada,
    textoRefatorado: n.textoRefatorado,
  }));

  return NextResponse.json({
    sucesso: true,
    total: data.length,
    exportadoEm: new Date(),
    noticias: data,
  });
}

function exportTXT(noticias: any[]) {
  let txt = '='.repeat(80) + '\n';
  txt += 'RELATÓRIO DE NOTÍCIAS\n';
  txt += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n`;
  txt += `Total de notícias: ${noticias.length}\n`;
  txt += '='.repeat(80) + '\n\n';

  noticias.forEach((n, index) => {
    txt += `${index + 1}. ${n.titulo}\n`;
    txt += `-`.repeat(80) + '\n';
    txt += `Categoria: ${n.categoria}\n`;
    txt += `Data: ${new Date(n.dataPublicacao).toLocaleDateString('pt-BR')}\n`;
    txt += `URL: ${n.url}\n`;
    txt += `Refatorada: ${n.refatorada ? 'Sim' : 'Não'}\n`;
    
    if (n.textoRefatorado) {
      txt += `\nTexto Refatorado:\n${n.textoRefatorado}\n`;
    }
    
    txt += '\n' + '='.repeat(80) + '\n\n';
  });

  return new Response(txt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="noticias_${Date.now()}.txt"`,
    },
  });
}