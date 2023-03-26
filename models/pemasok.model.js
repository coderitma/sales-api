const { knex } = require("../config/dbsql");

const TABLE = "pemasok";
const ModelPemasok = {};

ModelPemasok.pemasokExist = async (kodePemasok) => {
  let pemasok = await knex(TABLE).where("kodePemasok", kodePemasok);
  if (pemasok) {
    return pemasok[0];
  }
};

ModelPemasok.create = async (pemasok) => {
  await knex(TABLE).insert(pemasok);
  return pemasok;
};

ModelPemasok.list = async (page, limit, kodePemasok, namaPemasok) => {
  limit = limit ? parseInt(limit) : 10;
  page = page ? parseInt(page) : 1;
  console.log(page);
  if (page < 1) page = 1;
  let offset = (page - 1) * limit;

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
  totalPage = Math.ceil(totalData.count / limit);
  let prev = page - 1 > 0 ? page - 1 : null;
  let next = page + 1 > totalPage ? null : page + 1;
  console.log(limit, totalPage, "aa");
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

ModelPemasok.get = async (kodePemasok) => {
  return await knex(TABLE).where("kodePemasok", kodePemasok);
};

ModelPemasok.edit = async (kodePemasok, pemasok) => {
  await knex(TABLE).where("kodePemasok", kodePemasok).update(pemasok);
  return pemasok;
};

ModelPemasok.delete = async (kodePemasok) => {
  await knex(TABLE).where("kodePemasok", kodePemasok).del();
  return null;
};

module.exports = ModelPemasok;
