// src/lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export class GeminiRefactor {
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  async refatorarNoticia(titulo: string, conteudo: string): Promise<string> {
    const prompt = `
Você é um editor profissional de notícias. Sua tarefa é refatorar o texto abaixo seguindo estas diretrizes:

1. **Corrigir erros**: Gramática, ortografia, pontuação e concordância
2. **Melhorar clareza**: Tornar o texto mais claro e objetivo
3. **Manter tom jornalístico**: Profissional, imparcial e informativo
4. **Preservar fatos**: Não inventar ou alterar informações factuais
5. **Otimizar estrutura**: Organizar parágrafos de forma lógica
6. **Remover redundâncias**: Eliminar repetições desnecessárias
7. **Manter tamanho similar**: Não encurtar demais nem alongar muito

TÍTULO: ${titulo}

CONTEÚDO ORIGINAL:
${conteudo}

IMPORTANTE: Retorne APENAS o texto refatorado, sem explicações adicionais, comentários ou meta-informações.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return text.trim();
    } catch (error) {
      console.error('Erro ao refatorar com Gemini:', error);
      throw new Error('Falha ao refatorar o texto com a IA');
    }
  }

  async refatorarMultiplas(noticias: Array<{ titulo: string; conteudo: string }>): Promise<string[]> {
    const promises = noticias.map(n => this.refatorarNoticia(n.titulo, n.conteudo));
    
    try {
      return await Promise.all(promises);
    } catch (error) {
      console.error('Erro ao refatorar múltiplas notícias:', error);
      throw error;
    }
  }

  async gerarResumo(titulo: string, conteudo: string): Promise<string> {
    const prompt = `
Crie um resumo conciso (máximo 2-3 frases) da seguinte notícia:

TÍTULO: ${titulo}

CONTEÚDO:
${conteudo}

Retorne APENAS o resumo, sem prefixos como "Resumo:" ou outras explicações.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return text.trim();
    } catch (error) {
      console.error('Erro ao gerar resumo com Gemini:', error);
      throw new Error('Falha ao gerar resumo com a IA');
    }
  }
}

export default new GeminiRefactor();
