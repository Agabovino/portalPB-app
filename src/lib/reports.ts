// ============================================
// SISTEMA DE AGENDAMENTO DE RELATÓRIOS
// ============================================

// src/lib/reports.ts
import NoticiaModel from '@/models/Noticia';
import nodemailer from 'nodemailer';

export class ReportGenerator {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async generateDailyReport() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const noticias = await NoticiaModel.find({
      coletadaEm: { $gte: hoje },
    });

    const porCategoria = noticias.reduce((acc, n) => {
      acc[n.categoria] = (acc[n.categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const porSentimento = noticias.reduce((acc, n) => {
      acc[n.sentimento || 'NEUTRO'] = (acc[n.sentimento || 'NEUTRO'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      data: hoje,
      total: noticias.length,
      refatoradas: noticias.filter(n => n.refatorada).length,
      porCategoria,
      porSentimento,
      topNoticias: noticias.slice(0, 10),
    };
  }

  async sendDailyReportEmail(email: string) {
    const report = await this.generateDailyReport();

    const html = `
      <h1>📊 Relatório Diário de Notícias</h1>
      <p><strong>Data:</strong> ${report.data.toLocaleDateString('pt-BR')}</p>
      
      <h2>Resumo</h2>
      <ul>
        <li>Total de notícias: ${report.total}</li>
        <li>Refatoradas: ${report.refatoradas}</li>
      </ul>

      <h2>Por Categoria</h2>
      <ul>
        ${Object.entries(report.porCategoria)
          .map(([cat, count]) => `<li>${cat}: ${count}</li>`)
          .join('')}
      </ul>

      <h2>Por Sentimento</h2>
      <ul>
        ${Object.entries(report.porSentimento)
          .map(([sent, count]) => `<li>${sent}: ${count}</li>`)
          .join('')}
      </ul>

      <h2>Top 10 Notícias</h2>
      <ol>
        ${report.topNoticias
          .map(n => `<li><a href="${n.url}">${n.titulo}</a></li>`)
          .join('')}
      </ol>
    `;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: `Relatório Diário - ${report.data.toLocaleDateString('pt-BR')}`,
      html,
    });
  }
}

export default new ReportGenerator();
