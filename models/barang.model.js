const { knex } = require("../config/dbsql");
const { pageLimitOffset, prevNext } = require("../helpers/pagination.helper");

const TABLE = "barang";
const ModelBarang = {};

ModelBarang.barangExist = async (kodeBarang) => {
  let barang = await knex(TABLE).where("kodeBarang", kodeBarang);
  if (barang) {
    return barang[0];
  }
};

ModelBarang.create = async (req) => {
  let { body } = req;
  await knex(TABLE).insert(body);
  return body;
};

// page, limit, kodeBarang, namaBarang
ModelBarang.list = async (req) => {
  let { kodeBarang, namaBarang } = req.query;
  let { page, limit, offset } = pageLimitOffset(req);

  let qb = knex(TABLE);
  let qbCount = knex(TABLE);

  if (kodeBarang) {
    qb = qb.whereLike("kodeBarang", `%${kodeBarang}%`);
    qbCount = qbCount.whereLike("kodeBarang", `%${kodeBarang}%`);
  }

  if (namaBarang) {
    qb = qb.whereLike("namaBarang", `%${namaBarang}%`);
    qbCount = qbCount.whereLike("namaBarang", `%${namaBarang}%`);
  }

  let totalData = await qbCount.count("* as count").first();
  results = await qb.limit(limit).offset(offset);

  let { prev, next } = prevNext(totalData.count, limit, page);

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

ModelBarang.get = async (req) => {
  let { kodeBarang } = req.params;
  let barang = await knex(TABLE).where("kodeBarang", kodeBarang);

  if (barang && barang.length > 0) return barang[0];

  throw { message: "Barang: not found", status: 404 };
};

ModelBarang.edit = async (kodeBarang, barang) => {
  await knex(TABLE).where("kodeBarang", kodeBarang).update(barang);
  return barang;
};

ModelBarang.delete = async (kodeBarang) => {
  await knex(TABLE).where("kodeBarang", kodeBarang).del();
  return null;
};

module.exports = ModelBarang;
