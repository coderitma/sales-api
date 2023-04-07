const ModelBarang = require("../models/barang.model");
const {
  setResponseError,
  STATUS_CODE_400,
  STATUS_CODE_404,
} = require("../utils/helpers");
const BarangValidator = {};

const validateKodeBarang = async (kodeBarang) => {
  if (!kodeBarang)
    throw setResponseError(STATUS_CODE_400, "Kode barang harus tersedia");

  if (await ModelBarang.getFromKodeBarang(kodeBarang))
    throw setResponseError(STATUS_CODE_400, "Kode barang sudah pernah dibuat");
};

const validateNamaBarang = (namaBarang) => {
  if (!namaBarang)
    throw setResponseError(STATUS_CODE_400, "Nama barang harus tersedia");
};

const validateHargaBeli = (hargaBeli) => {
  if (!Number.isInteger(hargaBeli))
    throw setResponseError(STATUS_CODE_400, "Harga beli harus angka");

  if (hargaBeli <= 0)
    throw setResponseError(STATUS_CODE_400, "Harga beli harus lebih dari 0");
};

const validateHargaJual = (hargaJual) => {
  if (!Number.isInteger(hargaJual))
    throw setResponseError(STATUS_CODE_400, "Harga jual harus angka");

  if (hargaBeli <= 0)
    throw setResponseError(STATUS_CODE_400, "Harga jual harus lebih dari 0");
};

const validateJumlahBarang = (jumlahBarang) => {
  if (!Number.isInteger(jumlahBarang))
    throw setResponseError(STATUS_CODE_400, "Jumlah barang harus angka");

  if (jumlahBarang <= 0)
    throw setResponseError(
      STATUS_CODE_400,
      "Jumlah barang harus ada dan harus lebih dari 0"
    );
};

const validateHargaJualAndHargaBeli = (hargaJual, hargaBeli) => {
  if (hargaJual <= hargaBeli)
    throw setResponseError(
      STATUS_CODE_400,
      "Harga jual harus lebih besar dari harga beli"
    );
};

BarangValidator.create = async (req) => {
  const { body } = req;

  await validateKodeBarang(body.kodeBarang);
  validateNamaBarang(body.namaBarang);
  validateHargaBeli(body.hargaBeli);
  validateHargaJual(body.hargaJual);
  validateHargaJualAndHargaBeli(body.hargaJual, body.hargaBeli);
  validateJumlahBarang(body.jumlahBarang);
};

BarangValidator.edit = async (req) => {
  const { body } = req;
  const { kodeBarang } = req.params;

  await validateKodeBarang(kodeBarang);
  validateNamaBarang(body.namaBarang);
  validateHargaBeli(body.hargaBeli);
  validateHargaJual(body.hargaJual);
  validateHargaJualAndHargaBeli(body.hargaJual, body.hargaBeli);
  validateJumlahBarang(body.jumlahBarang);
};

module.exports = BarangValidator;
