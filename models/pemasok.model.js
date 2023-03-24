const mongoose = require("mongoose");

const pemasokSchema = new mongoose.Schema({
  kodePemasok: { type: String, unique: true },
  namaPemasok: { type: String, default: null },
  alamatPemasok: { type: String, default: null },
  teleponPemasok: { type: String, default: null },
});

module.exports = mongoose.model("pemasok", pemasokSchema);
