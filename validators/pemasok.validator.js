const ModelPemasok = require("../models/pemasok.model");
const { setResponseError, STATUS_CODE_400 } = require("../utils/helpers");

const PemasokValidator = {};

const validateKodePemasok = async (kodePemasok, foredit) => {
  if (!kodePemasok)
    throw setResponseError(STATUS_CODE_400, "Kode pemasok harus tersedia");

  if (!foredit && (await ModelPemasok.getFromKodePemasok(kodePemasok))) {
    throw setResponseError(STATUS_CODE_400, "Kode pemasok sudah pernah dibuat");
  }
  if (foredit && !(await ModelPemasok.getFromKodePemasok(kodePemasok))) {
    throw setResponseError(STATUS_CODE_400, "Kode pemasok tidak tersedia");
  }
};

const validateNamaPemasok = (namaPemasok) => {
  if (!namaPemasok) {
    throw setResponseError(STATUS_CODE_400, "Nama pemasok harus tersedia");
  }

  if (!(new String(namaPemasok) instanceof String)) {
    throw setResponseError(STATUS_CODE_400, "Nama pemasok harus string");
  }

  if (!(namaPemasok.length > 10)) {
    throw setResponseError(STATUS_CODE_400, "Nama pemasok minimal 11 karakter");
  }
};

const validateAlamatPemasok = (alamatPemasok) => {
  if (!alamatPemasok)
    throw setResponseError(STATUS_CODE_400, "Alamat pemasok harus tersedia");

  if (!(new String(alamatPemasok) instanceof String))
    throw setResponseError(STATUS_CODE_400, "Alamat pemasok ");

  if (!(alamatPemasok.length > 10))
    throw setResponseError(
      STATUS_CODE_400,
      "Alamat pemasok minimal 11 karakter"
    );
};

const validateTeleponPemasok = (teleponPemasok) => {
  if (!teleponPemasok)
    throw setResponseError(STATUS_CODE_400, "Telepon pemasok harus tersedia");

  if (!(new String(teleponPemasok) instanceof String))
    throw setResponseError(
      STATUS_CODE_400,
      "Telepon pemasok harus string numerik"
    );

  if (!/^\d+$/.test(teleponPemasok))
    throw setResponseError(
      STATUS_CODE_400,
      "Telepon pemasok harus string angka yang valid"
    );

  if (!(teleponPemasok.length > 10 && teleponPemasok.length < 14))
    throw setResponseError(
      STATUS_CODE_400,
      "Telepon pemasok harus 11 atau kurang dari 14 karakter"
    );
};

PemasokValidator.create = async (req) => {
  const { body } = req;
  await validateKodePemasok(body.kodePemasok);
  validateNamaPemasok(body.namaPemasok);
  validateAlamatPemasok(body.alamatPemasok);
  validateTeleponPemasok(body.teleponPemasok);
};

PemasokValidator.edit = async (req) => {
  const { body } = req;
  const { kodePemasok } = req.params;

  await validateKodePemasok(kodePemasok, true);
  validateNamaPemasok(body.namaPemasok);
  validateAlamatPemasok(body.alamatPemasok);
  validateTeleponPemasok(body.teleponPemasok);
};

PemasokValidator.validator = {
  validateAlamatPemasok,
  validateKodePemasok,
  validateNamaPemasok,
  validateTeleponPemasok,
};

module.exports = PemasokValidator;
