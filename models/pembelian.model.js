const mongoose = require("mongoose");

const pembelianSchema = new mongoose.Schema({
  faktur: { type: String, unique: true },
  tanggal: { type: Date, timestamps: true },
  total: { type: Number, default: 0 },
  dibayar: { type: Number, default: 0 },
  kembali: { type: Number, default: 0 },
  pemasok: {
    kodePemasok: String,
    namaPemasok: String,
    alamatPemasok: String,
    teleponPemasok: String,
  },
  item: [
    {
      kodeBarang: String,
      namaBarang: String,
      hargaBeli: Number,
      hargaJual: Number,
      jumlahBarang: Number,
    },
  ],
});

module.exports = mongoose.model("pembelian", pembelianSchema);
