import mongoose from 'mongoose';

const URLSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true,
  },
  categoria: {
    type: String,
    required: true,
  },
  ativo: {
    type: Boolean,
    default: true,
  },
  dataInicio: Date,
  dataFim: Date,
  ultimaColeta: Date,
  pausado: {
    type: Boolean,
    default: false,
  },
  criadaEm: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.URL || mongoose.model('URL', URLSchema);

