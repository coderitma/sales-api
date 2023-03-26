const { knex } = require("../config/dbsql");

const TABLE = "barang";
const ModelBarang = {};

ModelBarang.barangExist = async (kodeBarang) => {
  let barang = await knex(TABLE).where("kodeBarang", kodeBarang);
  if (barang) {
    return barang[0];
  }
};

ModelBarang.create = async (barang) => {
  await knex(TABLE).insert(barang);
  return barang;
};

ModelBarang.list = async (page, limit, kodeBarang, namaBarang) => {
  limit = limit ? parseInt(limit) : 10;
  page = page ? parseInt(page) : 1;
  console.log(page);
  if (page < 1) page = 1;
  let offset = (page - 1) * limit;

  let qb = knex(TABLE);
  let qbCount = knex(TABLE);

  if (kodeBarang) {
    qb = qb.whereLike("kodeBarang", `%${kodeBarang}%`);
    qbCount = qbCount.whereLike("kodeBarang", `%${kodeBarang}%`);
  }

  if (namaBarang) {
    qb = db.whereLike("namaBarang", `%${namaBarang}%`);
    qbCount = qbCount.whereLike("namaBarang", `%${namaBarang}%`);
  }

  let totalData = await qbCount.count("* as count").first();
  results = await qb.limit(limit).offset(offset);
  totalPage = Math.ceil(totalData.count / limit);
  let prev = page - 1 > 0 ? page - 1 : null;
  let next = page + 1 > totalPage ? null : page + 1;

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

ModelBarang.get = async (kodeBarang) => {
  return await knex(TABLE).where("kodeBarang", kodeBarang);
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
