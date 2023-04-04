const { knex } = require("../config/dbsql");
const {
  pageLimitOffset,
  prevNext,
  setResponseError,
  STATUS_CODE_404,
} = require("../utils/helpers");

const ModelPemasok = require("./pemasok.model");
var xl = require("excel4node");

const TABLE = "pembelian";
const ModelPembelian = {};

ModelPembelian.create = async (req) => {
  let { body } = req;
  await knex.transaction(async (trx) => {
    const { pemasok, item, ...pembelian } = body;

    // menghitung harga total dari quantity
    let total = 0;
    // menyiapkan data item
    let dataInsertItemBeli = [];

    for (let i = 0; i < item.length; i++) {
      total += item[i].hargaBeli * item[i].jumlahBeli;
      let temp = {
        faktur: pembelian.faktur,
        kodeBarang: item[i].kodeBarang,
        namaBarang: item[i].namaBarang,
        hargaBeli: item[i].hargaBeli,
        hargaJual: item[i].hargaJual,
        jumlahBeli: item[i].jumlahBeli,
        subtotal: item[i].hargaBeli * item[i].jumlahBeli,
      };
      dataInsertItemBeli.push(temp);
    }

    // menyimpan pembelian
    await knex(TABLE).transacting(trx).insert({
      faktur: pembelian.faktur,
      tanggal: pembelian.tanggal,
      total: total,
      kodePemasok: pemasok.kodePemasok,
    });

    await knex("item_beli")
      .transacting(trx)
      .insert([...dataInsertItemBeli]);

    // update stock
    for (let i = 0; i < item.length; i++) {
      let data = await knex("barang")
        .where("kodeBarang", item[i].kodeBarang)
        .select();
      await knex("barang")
        .transacting(trx)
        .where("kodeBarang", item[i].kodeBarang)
        .update("jumlahBarang", data[0].jumlahBarang - item[i].jumlahBeli);
    }
  });

  return body;
};

ModelPembelian.list = async (req) => {
  let { faktur, kodePemasok } = req.query;
  let { page, limit, offset } = pageLimitOffset(req);

  let qb = knex(TABLE);
  let qbCount = knex(TABLE);

  if (faktur) {
    qb = qb.whereLike("faktur", `%${faktur}%`);
    qbCount = qbCount.whereLike("faktur", `%${faktur}%`);
  }

  if (kodePemasok) {
    qb = qb.whereLike("kodePemasok", `%${kodePemasok}%`);
    qbCount = qbCount.whereLike("kodePemasok", `%${kodePemasok}%`);
  }

  let totalData = await qbCount.count("* as count").first();
  results = await qb.limit(limit).offset(offset);
  let { prev, next } = prevNext(totalData.count, limit, page);

  return {
    pagination: { page, limit, next, prev },
    results,
  };
};

ModelPembelian.get = async (req) => {
  let { faktur } = req.params;
  let pembelian = (await knex("pembelian").where("faktur", faktur))[0];

  if (!pembelian) throw setResponseError(STATUS_CODE_404);

  let pemasok = (await ModelPemasok.getFromPembelian(pembelian))[0];
  let item = await knex("item_beli").where("faktur", pembelian.faktur);

  return { ...pembelian, pemasok, item };
};

module.exports = ModelPembelian;
