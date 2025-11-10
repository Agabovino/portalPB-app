// src/lib/monitor.ts
import dbConnect from './db';
import URLModel from '@/models/URL';
import NoticiaModel from '@/models/Noticia';
import scraper from './scraper';
import gemini from './gemini';

export class MonitoringService {
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();
  private isMonitoring: Map<string, boolean> = new Map();
  private subscribers: Set<(data: any) => void> = new Set();

  subscribe(callback: (data: any) => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notify(data: any) {
    this.subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Erro ao notificar subscriber:', error);
      }
    });
  }

  async startMonitoring(urlId: string, intervalMinutes: number = 5) {
    if (this.isMonitoring.get(urlId)) {
      console.log(`Monitoramento já está ativo para URL ${urlId}`);
      return;
    }

    await dbConnect();
    const urlDoc = await URLModel.findById(urlId);
    
    if (!urlDoc) {
      throw new Error('URL não encontrada');
    }

    this.isMonitoring.set(urlId, true);

    // Executar primeira coleta imediatamente
    await this.collectNews(urlId);

    // Configurar polling
    const interval = setInterval(async () => {
      if (!this.isMonitoring.get(urlId)) {
        clearInterval(interval);
        return;
      }

      try {
        await this.collectNews(urlId);
      } catch (error) {
        console.error(`Erro no monitoramento de ${urlId}:`, error);
        this.notify({
          type: 'error',
          urlId,
          message: 'Erro ao coletar notícias',
        });
      }
    }, intervalMinutes * 60 * 1000);

    this.monitoringIntervals.set(urlId, interval);

    console.log(`✅ Monitoramento iniciado para URL ${urlId}`);
    this.notify({
      type: 'monitoring_started',
      urlId,
    });
  }

  async stopMonitoring(urlId: string) {
    const interval = this.monitoringIntervals.get(urlId);
    
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(urlId);
    }

    this.isMonitoring.set(urlId, false);

    console.log(`🛑 Monitoramento parado para URL ${urlId}`);
    this.notify({
      type: 'monitoring_stopped',
      urlId,
    });
  }

  async pauseMonitoring(urlId: string) {
    await dbConnect();
    await URLModel.findByIdAndUpdate(urlId, { pausado: true });
    this.stopMonitoring(urlId);
  }

  async resumeMonitoring(urlId: string) {
    await dbConnect();
    await URLModel.findByIdAndUpdate(urlId, { pausado: false });
    await this.startMonitoring(urlId);
  }

  private async collectNews(urlId: string) {
    await dbConnect();
    
    const urlDoc = await URLModel.findById(urlId);
    
    if (!urlDoc || !urlDoc.ativo || urlDoc.pausado) {
      return;
    }

    console.log(`🔍 Coletando notícias de: ${urlDoc.url}`);

    try {
      // Gerar URLs com paginação
      const urls = await scraper.detectPagination(urlDoc.url, 3);
      let todasNoticias: any[] = [];

      // Coletar de todas as páginas
      for (const pageUrl of urls) {
        const noticias = await scraper.scrapePage(pageUrl);
        todasNoticias = todasNoticias.concat(noticias);
      }

      console.log(`📰 Encontradas ${todasNoticias.length} notícias`);

      let novasNoticias = 0;

      // Processar cada notícia
      for (const noticia of todasNoticias) {
        try {
          // Verificar se já existe
          const existe = await NoticiaModel.findOne({ url: noticia.url });
          
          if (existe) {
            continue;
          }

          // Buscar conteúdo completo
          const conteudoBruto = await scraper.scrapeFullContent(noticia.url);

          // Gerar resumo se não tiver
          let resumo = noticia.resumo;
          if (!resumo && conteudoBruto) {
            try {
              resumo = await gemini.gerarResumo(noticia.titulo, conteudoBruto.substring(0, 1000));
            } catch (error) {
              console.error('Erro ao gerar resumo:', error);
            }
          }

          // Salvar no banco
          const novaNoticia = new NoticiaModel({
            titulo: noticia.titulo,
            url: noticia.url,
            dataPublicacao: noticia.dataPublicacao || new Date(),
            categoria: urlDoc.categoria,
            conteudoBruto,
            imagemUrl: noticia.imagemUrl,
            resumo,
            urlMonitorada: urlDoc.url,
          });

          await novaNoticia.save();
          novasNoticias++;

          // Notificar nova notícia
          this.notify({
            type: 'new_article',
            urlId,
            noticia: {
              _id: novaNoticia._id,
              titulo: novaNoticia.titulo,
              url: novaNoticia.url,
              imagemUrl: novaNoticia.imagemUrl,
              resumo: novaNoticia.resumo,
              categoria: novaNoticia.categoria,
              dataPublicacao: novaNoticia.dataPublicacao,
            },
          });

          console.log(`✅ Nova notícia salva: ${noticia.titulo}`);
        } catch (error) {
          console.error(`Erro ao processar notícia ${noticia.url}:`, error);
        }
      }

      // Atualizar timestamp da última coleta
      await URLModel.findByIdAndUpdate(urlId, {
        ultimaColeta: new Date(),
      });

      console.log(`✅ Coleta finalizada: ${novasNoticias} novas notícias`);

      this.notify({
        type: 'collection_completed',
        urlId,
        novasNoticias,
        totalProcessadas: todasNoticias.length,
      });

    } catch (error) {
      console.error('Erro na coleta:', error);
      throw error;
    }
  }

  async getMonitoringStatus() {
    await dbConnect();
    const urls = await URLModel.find();
    
    const status = await Promise.all(
      urls.map(async (url) => {
        if (!url || !url.url) {
          console.warn('URL document is missing or malformed (missing url field)', url);
          return null; // Ou um objeto de erro apropriado
        }

        const totalNoticias = await NoticiaModel.countDocuments({
          urlMonitorada: url.url,
        });

        return {
          urlId: url._id.toString(),
          url: url.url,
          ativo: url.ativo,
          pausado: url.pausado,
          ultimaColeta: url.ultimaColeta,
          totalNoticias,
        };
      })
    );

    return status.filter(s => s !== null); // Filtrar quaisquer resultados nulos
  }

  stopAllMonitoring() {
    this.monitoringIntervals.forEach((interval, urlId) => {
      clearInterval(interval);
      this.isMonitoring.set(urlId, false);
    });
    this.monitoringIntervals.clear();
    console.log('🛑 Todos os monitoramentos foram parados');
  }
}

export default new MonitoringService();
