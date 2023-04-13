const ModelBarang = require("../models/barang.model");
const ModelPemasok = require("../models/pemasok.model");
const ModelPembelian = require("../models/pembelian.model");
const { setResponseError, STATUS_CODE_400 } = require("../utils/helpers");
const BarangValidator = require("./barang.validator");
const PemasokValidator = require("./pemasok.validator");

const PembelianValidator = {};

const validateFaktur = async (faktur, foredit) => {
  if (!faktur) {
    throw setResponseError(STATUS_CODE_400, "Faktur harus tersedia");
  }

  if (!foredit && (await ModelPembelian.getFromFaktur(faktur))) {
    throw setResponseError(STATUS_CODE_400, "Faktur sudah pernah dibuat");
  }

  if (foredit && !(await ModelPembelian.getFromFaktur(faktur))) {
    throw setResponseError(STATUS_CODE_400, "Faktur tidak tersedia");
  }
};

const validateTanggal = (tanggal) => {
  if (!tanggal) {
    throw setResponseError(STATUS_CODE_400, "Tanggal harus terdedia");
  }
};

const validateTotal = (total) => {
  if (!total) {
    throw setResponseError(STATUS_CODE_400, "Total harus tersedia");
  }

  if (!Number.isInteger(total)) {
    throw setResponseError(STATUS_CODE_400, "Total harus angka");
  }

  if (total <= 0) {
    throw setResponseError(STATUS_CODE_400, "Total harus lebih besar dari 0");
  }
};

const validateDibayar = (dibayar) => {
  if (!dibayar) {
    throw setResponseError(STATUS_CODE_400, "Dibayar harus tersedia");
  }

  if (!Number.isInteger(dibayar)) {
    throw setResponseError(STATUS_CODE_400, "Dibayar harus angka");
  }

  if (dibayar <= 0) {
    throw setResponseError(STATUS_CODE_400, "Dibayar harus lebih besar dari 0");
  }
};

const validateKembali = (kembali) => {
  if (kembali === null) {
    throw setResponseError(STATUS_CODE_400, "Kembali harus tersedia");
  }

  if (!Number.isInteger(kembali)) {
    throw setResponseError(STATUS_CODE_400, "Kembali harus angka");
  }

  if (kembali < 0) {
    throw setResponseError(
      STATUS_CODE_400,
      "Kembali harus lebih besar atau sama dengan 0"
    );
  }
};

const validatePemasok = async (pemasok) => {
  await PemasokValidator.validator.validateKodePemasok(
    pemasok.kodePemasok,
    true
  );
  PemasokValidator.validator.validateNamaPemasok(pemasok.namaPemasok);
  PemasokValidator.validator.validateAlamatPemasok(pemasok.alamatPemasok);
  PemasokValidator.validator.validateTeleponPemasok(pemasok.teleponPemasok);
};

const validateDaftarBarang = async (daftarBarang) => {
  if (!daftarBarang) {
    throw setResponseError(STATUS_CODE_400, "Item harus tersedia");
  }

  if (!Array.isArray(daftarBarang)) {
    throw setResponseError(STATUS_CODE_400, "Item harus berupa array");
  }

  if (daftarBarang.length === 0) {
    throw setResponseError(
      STATUS_CODE_400,
      "Item minimal harus berisi satu barang"
    );
  }

  for (const item of daftarBarang) {
    await BarangValidator.validator.validateKodeBarang(item.kodeBarang, true);
    BarangValidator.validator.validateNamaBarang(item.namaBarang);
    BarangValidator.validator.validateHargaBeli(item.hargaBeli);
    BarangValidator.validator.validateHargaJual(item.hargaJual);
    BarangValidator.validator.validateJumlahBarang(item.jumlahBarang);
  }
};

const validateTotalDibayarKembali = (total, dibayar, kembali, daftarBarang) => {
  let count = 0;
  for (const item of daftarBarang) {
    if (!item.subtotal) {
      throw setResponseError(STATUS_CODE_400, "Subtotal harus tersedia");
    }

    if (!Number.isInteger(item.subtotal)) {
      throw setResponseError(STATUS_CODE_400, "Subtotal harus berupa angka");
    }

    if (item.subtotal <= 0) {
      throw setResponseError(
        STATUS_CODE_400,
        "Subtotal harus lebih besar dari 0"
      );
    }

    if (!item.jumlahBeli) {
      throw setResponseError(STATUS_CODE_400, "Jumlah beli harus tersedia");
    }

    if (!Number.isInteger(item.jumlahBeli)) {
      throw setResponseError(STATUS_CODE_400, "Jumlah beli harus berupa angka");
    }

    if (item.jumlahBeli <= 0) {
      throw setResponseError(
        STATUS_CODE_400,
        "Jumlah beli harus lebih besar dari 0"
      );
    }

    // if (item.jumlahBeli >= item.jumlahBarang) {
    //   throw setResponseError(STATUS_CODE_400, "Stok tidak mecukupi");
    // }

    count = count + item.subtotal;
  }

  if (count != total) {
    throw setResponseError(STATUS_CODE_400, "Total tidak valid");
  }

  if (dibayar < total) {
    throw setResponseError(STATUS_CODE_400, "Pembayaran tidak cukup");
  }

  if (dibayar - total != kembali) {
    throw setResponseError(
      STATUS_CODE_400,
      "Pembayaran dan kembalian tidak valid"
    );
  }
};

PembelianValidator.create = async (req) => {
  const { body } = req;

  await validateFaktur(body.faktur);
  validateTanggal(body.tanggal);
  await validatePemasok(body.pemasok);
  await validateDaftarBarang(body.item);
  validateTotal(body.total);
  validateDibayar(body.dibayar);
  validateKembali(body.kembali);

  validateTotalDibayarKembali(
    body.total,
    body.dibayar,
    body.kembali,
    body.item
  );
};

module.exports = PembelianValidator;
