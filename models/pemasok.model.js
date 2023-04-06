const { pageLimitOffset, prevNext } = require("../utils/helpers");
const {
  setResponseError,
  STATUS_CODE_404,
} = require("../helpers/response.helpers");
const dbmaria = require("../utils/dbmaria");

const TABLE = "pemasok";
const ModelPemasok = {};

ModelPemasok.create = async (req) => {
  const { body } = req;
  await dbmaria(TABLE).insert(body);
  return body;
};

ModelPemasok.list = async (req) => {
  const { page, limit, offset } = pageLimitOffset(req);
  const { kodePemasok, namaPemasok } = req.query;
  let qb = dbmaria(TABLE);
  let qbCount = dbmaria(TABLE);

  if (kodePemasok) {
    qb = qb.whereLike("kodePemasok", `%${kodePemasok}%`);
    qbCount = qbCount.whereLike("kodePemasok", `%${kodePemasok}%`);
  }

  if (namaPemasok) {
    qb = qb.whereLike("namaPemasok", `%${namaPemasok}%`);
    qbCount = qbCount.whereLike("namaPemasok", `%${namaPemasok}%`);
  }

  let totalData = await qbCount.count("* as count").first();
  results = await qb.orderBy("kodePemasok", "desc").limit(limit).offset(offset);

  const { prev, next } = prevNext(totalData.count, limit, page);

  return {
    pagination: {
      page,
      limit,
      next,
      prev,
    },
    results,
  };
};

ModelPemasok.get = async (req) => {
  const { kodePemasok } = req.params;
  let pemasok = await dbmaria(TABLE).where("kodePemasok", kodePemasok);

  if (pemasok && pemasok.length > 0) {
    return pemasok[0];
  }

  throw setResponseError(STATUS_CODE_404);
};

ModelPemasok.getFromPembelian = async (pembelian) => {
  let pemasok = await dbmaria(TABLE).where(
    "kodePemasok",
    pembelian.kodePemasok
  );

  if (pemasok && pemasok.length > 0) {
    return pemasok[0];
  }

  throw setResponseError(STATUS_CODE_404);
};

ModelPemasok.edit = async (req) => {
  const { kodePemasok } = req.params;
  await ModelPemasok.get(req);
  const { body } = req;
  await dbmaria(TABLE).where("kodePemasok", kodePemasok).update(body);
  return body;
};

ModelPemasok.delete = async (req) => {
  const { kodePemasok } = req.params;
  await dbmaria(TABLE).where("kodePemasok", kodePemasok).del();
  return null;
};

module.exports = ModelPemasok;
