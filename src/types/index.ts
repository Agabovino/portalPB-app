// src/types/index.ts

export interface URL {
  _id?: string;
  url: string;
  categoria: string;
  ativo: boolean;
  dataInicio?: Date;
  dataFim?: Date;
  ultimaColeta?: Date;
  pausado: boolean;
  criadaEm: Date;
}

export interface Noticia {
  _id?: string;
  titulo: string;
  url: string;
  dataPublicacao: Date;
  categoria: string;
  conteudoBruto: string;
  imagemUrl?: string;
  resumo?: string;
  coletadaEm: Date;
  selecionada: boolean;
  refatorada: boolean;
  textoRefatorado?: string;
  urlMonitorada: string;
}

export interface ScrapingResult {
  noticias: NoticiaScraped[];
  erro?: string;
}

export interface NoticiaScraped {
  titulo: string;
  url: string;
  dataPublicacao?: Date;
  imagemUrl?: string;
  resumo?: string;
}

export interface MonitorStatus {
  urlId: string;
  url: string;
  ativo: boolean;
  pausado: boolean;
  ultimaColeta?: Date;
  totalNoticias: number;
}

export interface RefactorRequest {
  noticiaIds: string[];
}

export interface RefactorResponse {
  sucesso: boolean;
  processadas: number;
  erros: string[];
}

export interface APIMateria {
  id: string;
  titulo: string;
  url: string;
  dataPublicacao: Date;
  categoria: string;
  textoRefatorado: string;
  imagemUrl?: string;
}