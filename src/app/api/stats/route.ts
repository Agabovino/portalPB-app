// ============================================
// DASHBOARD COM ESTATÍSTICAS
// ============================================

// src/app/api/stats/route.ts
import { NextResponse } from 'next/server';
import dbConnect from "../../../lib/db"
import NoticiaModel from '../../../models/Noticia';
import URLModel from "../../../models/URL"

export async function GET() {
  try {
    await dbConnect();

    // Total de notícias
    const totalNoticias = await NoticiaModel.countDocuments();

    // Notícias refatoradas
    const totalRefatoradas = await NoticiaModel.countDocuments({ refatorada: true });

    // URLs monitoradas
    const totalURLs = await URLModel.countDocuments();
    const urlsAtivas = await URLModel.countDocuments({ ativo: true, pausado: false });

    // Notícias por categoria
    const porCategoria = await NoticiaModel.aggregate([
      {
        $group: {
          _id: '$categoria',
          total: { $sum: 1 },
          refatoradas: {
            $sum: { $cond: ['$refatorada', 1, 0] },
          },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Notícias por data (últimos 7 dias)
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

    const porDia = await NoticiaModel.aggregate([
      {
        $match: {
          coletadaEm: { $gte: seteDiasAtras },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$coletadaEm' },
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Últimas notícias coletadas
    const ultimasNoticias = await NoticiaModel.find()
      .sort({ coletadaEm: -1 })
      .limit(5)
      .select('titulo categoria coletadaEm');

    // Portais mais produtivos
    const portaisProdutivos = await NoticiaModel.aggregate([
      {
        $group: {
          _id: '$urlMonitorada',
          total: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 5 },
    ]);

    return NextResponse.json({
      sucesso: true,
      estatisticas: {
        resumo: {
          totalNoticias,
          totalRefatoradas,
          percentualRefatorado: totalNoticias > 0 
            ? ((totalRefatoradas / totalNoticias) * 100).toFixed(1)
            : 0,
          totalURLs,
          urlsAtivas,
        },
        porCategoria,
        porDia,
        ultimasNoticias,
        portaisProdutivos,
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { sucesso: false, erro: error.message },
      { status: 500 }
    );
  }
}