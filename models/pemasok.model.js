const { knex } = require("../config/dbsql");
const { pageLimitOffset, prevNext } = require("../utils/helpers");
const {
  setResponseError,
  STATUS_CODE_404,
} = require("../helpers/response.helpers");

const TABLE = "pemasok";
const ModelPemasok = {};

ModelPemasok.create = async (req) => {
  const { body } = req;
  await knex(TABLE).insert(body);
  return body;
};

ModelPemasok.list = async (req) => {
  const { page, limit, offset } = pageLimitOffset(req);
  const { kodePemasok, namaPemasok } = req.query;
  let qb = knex(TABLE);
  let qbCount = knex(TABLE);

  if (kodePemasok) {
    qb = qb.whereLike("kodePemasok", `%${kodePemasok}%`);
    qbCount = qbCount.whereLike("kodePemasok", `%${kodePemasok}%`);
  }

  if (namaPemasok) {
    qb = qb.whereLike("namaPemasok", `%${namaPemasok}%`);
    qbCount = qbCount.whereLike("namaPemasok", `%${namaPemasok}%`);
  }

  let totalData = await qbCount.count("* as count").first();
  results = await qb.limit(limit).offset(offset);

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
  let pemasok = await knex(TABLE).where("kodePemasok", kodePemasok);

  if (pemasok && pemasok.length > 0) {
    return pemasok[0];
  }

  throw setResponseError(STATUS_CODE_404);
};

ModelPemasok.getFromPembelian = async (pembelian) => {
  let pemasok = await knex(TABLE).where("kodePemasok", pembelian.kodePemasok);

  if (pemasok && pemasok.length > 0) {
    return pemasok[0];
  }

  throw setResponseError(STATUS_CODE_404);
};

ModelPemasok.edit = async (req) => {
  const { kodePemasok } = req.params;
  await ModelPemasok.get(req);
  const { body } = req;
  await knex(TABLE).where("kodePemasok", kodePemasok).update(body);
  return body;
};

ModelPemasok.delete = async (req) => {
  const { kodePemasok } = req.params;
  await knex(TABLE).where("kodePemasok", kodePemasok).del();
  return null;
};

module.exports = ModelPemasok;
