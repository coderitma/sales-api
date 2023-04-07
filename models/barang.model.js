const dbmaria = require("../utils/dbmaria");
const {
  pageLimitOffset,
  prevNext,
  setResponseError,
  STATUS_CODE_404,
} = require("../utils/helpers");

const TABLE = "barang";
const ModelBarang = {};

ModelBarang.create = async (req) => {
  // TODO: create body (payload) validation
  let { body } = req;
  await dbmaria(TABLE).insert(body);
  return body;
};

ModelBarang.list = async (req) => {
  let { kodeBarang, namaBarang } = req.query;
  let { page, limit, offset } = pageLimitOffset(req);

  let qb = dbmaria(TABLE);
  let qbCount = dbmaria(TABLE);

  if (kodeBarang) {
    qb = qb.whereILike("kodeBarang", `%${kodeBarang}%`);
    qbCount = qbCount.whereILike("kodeBarang", `%${kodeBarang}%`);
  }

  if (namaBarang) {
    qb = qb.whereILike("namaBarang", `%${namaBarang}%`);
    qbCount = qbCount.whereILike("namaBarang", `%${namaBarang}%`);
  }

  let totalData = await qbCount.count("* as count").first();
  results = await qb.orderBy("kodeBarang", "desc").limit(limit).offset(offset);

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
  let barang = await dbmaria(TABLE).where("kodeBarang", kodeBarang);

  if (barang && barang.length > 0) return barang[0];

  throw setResponseError(STATUS_CODE_404);
};

ModelBarang.getFromKodeBarang = async (kodeBarang) => {
  let barang = await dbmaria(TABLE).where("kodeBarang", kodeBarang);
  if (barang && barang.length > 0) return barang[0];
};

ModelBarang.edit = async (req) => {
  const { body } = req;
  const { kodeBarang } = req.params;
  await ModelBarang.get(req);
  await dbmaria(TABLE).where("kodeBarang", kodeBarang).update(body);
  return body;
};

ModelBarang.delete = async (req) => {
  const { kodeBarang } = req.params;
  await ModelBarang.get(req);
  await dbmaria(TABLE).where("kodeBarang", kodeBarang).del();
  return null;
};

module.exports = ModelBarang;
