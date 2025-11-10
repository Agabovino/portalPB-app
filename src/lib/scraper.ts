// src/lib/scraper.ts
import axios from 'axios';
import { load, type CheerioAPI } from 'cheerio';
import type { Element } from 'domhandler';
import { NoticiaScraped } from '@/types';

export class Scraper {
  private userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

  private scrapeG1Page($: CheerioAPI): NoticiaScraped[] {
    const noticias: NoticiaScraped[] = [];
    const jsonData = $('#bstn-container').text();

    if (jsonData) {
      try {
        const data = JSON.parse(jsonData);
        if (data && data.items) {
          for (const item of data.items) {
            if (item.content && item.content.type === 'materia') {
              const content = item.content;
              const imageUrl = content.image?.sizes?.S?.url || content.image?.url;

              const noticia: NoticiaScraped = {
                titulo: content.title,
                url: content.url,
                resumo: content.summary,
                imagemUrl: imageUrl,
                dataPublicacao: content.publication ? new Date(content.publication) : undefined,
              };
              noticias.push(noticia);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao fazer parse do JSON do G1:', error);
      }
    }
    return noticias;
  }

  async scrapePage(url: string): Promise<NoticiaScraped[]> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
        },
        timeout: 10000,
      });

      const $ = load(response.data);

      if (url.includes('g1.globo.com')) {
        const g1Noticias = this.scrapeG1Page($);
        if (g1Noticias.length > 0) {
          return g1Noticias;
        }
      }

      const noticias: NoticiaScraped[] = [];

      // Seletores genéricos comuns - podem ser personalizados por portal
      const possiveisSelectors = [
        'article',
        '.noticia',
        '.post',
        '.entry',
        '.card',
        '[class*="article"]',
        '[class*="noticia"]',
        '[class*="post"]',
      ];

      for (const selector of possiveisSelectors) {
        const elementos = $(selector);
        
        if (elementos.length > 0) {
          elementos.each((_, element) => {
            const noticia = this.extractNoticiaData($, element, url);
            if (noticia) {
              noticias.push(noticia);
            }
          });

          if (noticias.length > 0) break;
        }
      }

      return noticias;
    } catch (error) {
      console.error('Erro ao fazer scraping:', error);
      throw new Error(`Falha ao coletar notícias da URL: ${url}`);
    }
  }

  private extractNoticiaData($: CheerioAPI, element: Element, pageUrl: string): NoticiaScraped | null {
    try {
      const $el = $(element);

      // Extrair título
      const titulo =
        $el.find('h1, h2, h3, .titulo, .title, [class*="title"]').first().text().trim() ||
        $el.find('a').first().attr('title') ||
        '';

      if (!titulo) return null;

      // Extrair URL
      const linkElement = $el.find('a').first();
      let urlNoticia = linkElement.attr('href') || '';

      // Converter URL relativa em absoluta
      if (urlNoticia && !urlNoticia.startsWith('http')) {
        urlNoticia = new URL(urlNoticia, pageUrl).href;
      }

      if (!urlNoticia) return null;

      // Extrair imagem
      const imagemUrl =
        $el.find('img').first().attr('src') ||
        $el.find('img').first().attr('data-src') ||
        '';

      // Extrair resumo
      const resumo =
        $el.find('p, .resumo, .excerpt, [class*="description"]').first().text().trim() ||
        '';

      // Tentar extrair data
      const dataTexto =
        $el.find('time').attr('datetime') ||
        $el.find('[class*="date"], [class*="data"]').first().text().trim() ||
        '';

      let dataPublicacao: Date | undefined;
      if (dataTexto) {
        dataPublicacao = new Date(dataTexto);
        if (isNaN(dataPublicacao.getTime())) {
          dataPublicacao = undefined;
        }
      }

      return {
        titulo,
        url: urlNoticia,
        imagemUrl: imagemUrl || undefined,
        resumo: resumo || undefined,
        dataPublicacao,
      };
    } catch (error) {
      console.error('Erro ao extrair dados da notícia:', error);
      return null;
    }
  }

  async scrapeFullContent(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
        },
        timeout: 10000,
      });

      const $ = load(response.data);

      // Remover elementos indesejados
      $('script, style, nav, header, footer, aside, .comments, .ads, .advertisement').remove();

      // Tentar extrair o conteúdo principal
      const possiveisSelectors = [
        'article',
        '.content',
        '.post-content',
        '.entry-content',
        '[class*="article-body"]',
        '[class*="content"]',
        'main',
      ];

      for (const selector of possiveisSelectors) {
        const content = $(selector).first();
        if (content.length > 0) {
          // Extrair texto de parágrafos
          const paragrafos: string[] = [];
          content.find('p').each((_, el) => {
            const texto = $(el).text().trim();
            if (texto.length > 30) { // Ignorar parágrafos muito curtos
              paragrafos.push(texto);
            }
          });

          if (paragrafos.length > 0) {
            return paragrafos.join('\n\n');
          }
        }
      }

      // Fallback: pegar todos os parágrafos da página
      const paragrafos: string[] = [];
      $('p').each((_, el) => {
        const texto = $(el).text().trim();
        if (texto.length > 30) {
          paragrafos.push(texto);
        }
      });

      return paragrafos.join('\n\n');
    } catch (error) {
      console.error('Erro ao extrair conteúdo completo:', error);
      throw new Error(`Falha ao extrair conteúdo da URL: ${url}`);
    }
  }

  async detectPagination(baseUrl: string, maxPages: number = 5): Promise<string[]> {
    const urls: string[] = [];
    let currentPageUrl = baseUrl;

    for (let i = 0; i < maxPages; i++) {
      if (!currentPageUrl || urls.includes(currentPageUrl)) {
        break;
      }
      urls.push(currentPageUrl);

      try {
        const response = await axios.get(currentPageUrl, {
          headers: { 'User-Agent': this.userAgent },
          timeout: 10000,
        });

        const $ = load(response.data);
        
        // Tenta encontrar o link da próxima página com seletores mais específicos primeiro
        let nextPageLink = $('a.pagination__next, a.next-page, a.next, a[rel="next"]').first();

        // Fallback para seletores mais genéricos
        if (nextPageLink.length === 0) {
          nextPageLink = $('a:contains("Próxima"), a:contains("Next"), a:contains("Seguinte")').last();
        }

        if (nextPageLink.length > 0) {
          const nextUrl = new URL(nextPageLink.attr('href')!, currentPageUrl).href;
          currentPageUrl = nextUrl;
        } else {
          break; // No next page link found
        }
      } catch (error) {
        console.error(`Erro ao detectar paginação para ${currentPageUrl}:`, error);
        break;
      }
    }

    return urls;
  }
}

export default new Scraper();
