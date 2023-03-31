const ModelBarang = require("../models/barang.model");
const ModelPemasok = require("../models/pemasok.model");
const ModelPembelian = require("../models/pembelian.model");

const PembelianValidator = {};

PembelianValidator.create = async (req, res) => {
  let body = req.body;
  let errors = {
    message: "",
    status: 400,
  };

  let isError = false;

  if (!body) {
    throw { message: "Data tidak valid.", status: 400 };
  }

  // check faktur kosong atau tidak
  if (!body.faktur) {
    throw { message: "Nomor faktur tidak boleh kosong.", status: 400 };
  }

  // check faktur kosong atau tidak
  if (!body.tanggal) {
    throw { message: "Tanggal tidak boleh kosong.", status: 400 };
  }

  // check faktur sudah ada atau belum
  let fakturIsExist = await ModelPembelian.pembelianExist(body.faktur);
  if (fakturIsExist) {
    throw { message: "Faktur sudah pernah dibuat sebelumnya.", status: 400 };
  }

  // check pemasok ada
  if (!body.pemasok.kodePemasok) {
    throw { message: "Pemasok tidak boleh kosong.", status: 400 };
  }

  // check pemasok ada di database
  let pemasokIsExist = await ModelPemasok.pemasokExist(
    body.pemasok.kodePemasok
  );
  if (!pemasokIsExist) {
    throw { message: "Pemasok tidak ada di dalam database.", status: 400 };
  }

  // check item harus array
  if (!Array.isArray(body.item)) {
    throw { message: "Format item tidak valid.", status: 400 };
  }

  // check item harus ada
  if (body.item.length === 0) {
    throw { message: "Item tidak boleh kosong.", status: 400 };
  }

  for (const barang of body.item) {
    let isAvailable = await ModelBarang.barangExist(barang.kodeBarang);
    if (!isAvailable) {
      throw {
        message: `Barang dengan kode ${barang.kodeBarang} tidak tersedia.`,
        status: 400,
      };
    }
  }
  return { errors, isError };
};

module.exports = PembelianValidator;
