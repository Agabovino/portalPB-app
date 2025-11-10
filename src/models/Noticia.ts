import mongoose from 'mongoose';

const NoticiaSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
    unique: true,
  },
  dataPublicacao: {
    type: Date,
    required: true,
  },
  categoria: {
    type: String,
    required: true,
  },
  conteudoBruto: {
    type: String,
    required: true,
  },
  imagemUrl: String,
  resumo: String,
  coletadaEm: {
    type: Date,
    default: Date.now,
  },
  selecionada: {
    type: Boolean,
    default: false,
  },
  refatorada: {
    type: Boolean,
    default: false,
  },
  textoRefatorado: String,
  urlMonitorada: {
    type: String,
    required: true,
  },
});

// Índice composto para evitar duplicatas
NoticiaSchema.index({ url: 1 }, { unique: true });
NoticiaSchema.index({ urlMonitorada: 1, dataPublicacao: -1 });

export default mongoose.models.Noticia || mongoose.model('Noticia', NoticiaSchema);
