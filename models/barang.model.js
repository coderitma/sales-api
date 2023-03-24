const mongoose = require("mongoose");

const barangSchema = new mongoose.Schema({
  kodeBarang: { type: String, unique: true },
  namaBarang: { type: String, default: null },
  hargaBeli: { type: Number, default: 0 },
  hargaJual: { type: Number, default: 0 },
  jumlahBarang: { type: Number, default: 0 },
});

module.exports = mongoose.model("barang", barangSchema);
