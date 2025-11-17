// src/lib/openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class OpenAIRefactor {
  private model = 'gpt-4.1-mini';

  async refatorarNoticia(titulo: string, conteudo: string): Promise<string> {
    const prompt = `
Você é um editor profissional de notícias especializado em reescrita criativa. Sua tarefa é refatorar o texto abaixo, criando uma versão distinta do original ao parafrasear frases, usar sinônimos variados e reestruturar sentenças, enquanto segue estas diretrizes estritas:
1. **Corrigir erros**: Consertar gramática, ortografia, pontuação e concordância.
2. **Melhorar clareza e fluidez**: Tornar o texto mais objetivo, envolvente e fácil de ler, evitando repetições.
3. **Manter tom jornalístico**: Adotar um estilo profissional, imparcial e informativo.
4. **Preservar fatos**: Não adicionar, remover ou alterar informações factuais; mantenha a essência do conteúdo.
5. **Otimizar estrutura**: Organizar o texto em parágrafos lógicos, com fluxo natural e transições suaves.
6. **Evitar redundâncias**: Eliminar qualquer repetição desnecessária para maior concisão.
7. **Manter tamanho similar**: Produza um texto de comprimento aproximado ao original, sem encurtar ou alongar excessivamente.
8. **Garantir originalidade**: Reescreva em palavras próprias para diferenciar da versão original, sem copiar frases idênticas.

TÍTULO: ${titulo}
CONTEÚDO ORIGINAL:
${conteudo}

IMPORTANTE: Retorne APENAS o texto refatorado completo, incluindo o título, sem qualquer explicação, comentário, introdução ou meta-informação adicional.
`;

    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });
      const text = response.choices[0].message?.content;
      
      return text?.trim() || '';
    } catch (error) {
      console.error('Erro ao refatorar com OpenAI:', error);
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
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });
      const text = response.choices[0].message?.content;
      
      return text?.trim() || '';
    } catch (error) {
      console.error('Erro ao gerar resumo com OpenAI:', error);
      throw new Error('Falha ao gerar resumo com a IA');
    }
  }
}

export default new OpenAIRefactor();
