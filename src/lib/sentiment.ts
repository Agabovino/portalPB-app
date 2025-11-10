// ============================================
// ANÁLISE DE SENTIMENTO COM GEMINI
// ============================================

// src/lib/sentiment.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export class SentimentAnalyzer {
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  async analyzeSentiment(titulo: string, conteudo: string) {
    const prompt = `
Analise o sentimento da seguinte notícia e classifique como:
- POSITIVO: Notícias boas, progresso, conquistas
- NEGATIVO: Problemas, críticas, tragédias
- NEUTRO: Informativo, sem carga emocional forte

Retorne APENAS uma palavra: POSITIVO, NEGATIVO ou NEUTRO.

TÍTULO: ${titulo}

CONTEÚDO: ${conteudo.substring(0, 500)}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const sentiment = response.text().trim().toUpperCase();
      
      if (['POSITIVO', 'NEGATIVO', 'NEUTRO'].includes(sentiment)) {
        return sentiment;
      }
      
      return 'NEUTRO';
    } catch (error) {
      console.error('Erro na análise de sentimento:', error);
      return 'NEUTRO';
    }
  }

  async extractKeywords(conteudo: string, limit: number = 5) {
    const prompt = `
Extraia as ${limit} palavras-chave mais importantes do seguinte texto.
Retorne APENAS as palavras separadas por vírgula, sem numeração ou explicações.

TEXTO: ${conteudo.substring(0, 1000)}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const keywords = response.text()
        .trim()
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);
      
      return keywords.slice(0, limit);
    } catch (error) {
      console.error('Erro ao extrair palavras-chave:', error);
      return [];
    }
  }

  async detectFakeNews(titulo: string, conteudo: string) {
    const prompt = `
Analise a seguinte notícia e avalie a probabilidade de ser fake news.
Considere: sensacionalismo, falta de fontes, linguagem emocional excessiva.

Retorne um JSON no formato:
{
  "score": 0-100,
  "risco": "BAIXO|MÉDIO|ALTO",
  "motivos": ["razão 1", "razão 2"]
}

TÍTULO: ${titulo}

CONTEÚDO: ${conteudo.substring(0, 800)}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      // Extrair JSON da resposta
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        score: 0,
        risco: 'BAIXO',
        motivos: [],
      };
    } catch (error) {
      console.error('Erro na detecção de fake news:', error);
      return {
        score: 0,
        risco: 'DESCONHECIDO',
        motivos: ['Erro na análise'],
      };
    }
  }
}

export default new SentimentAnalyzer();