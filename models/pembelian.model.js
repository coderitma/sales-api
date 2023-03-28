const { knex } = require("../config/dbsql");
const ModelPemasok = require("./pemasok.model");

const TABLE = "pembelian";
const ModelPembelian = {};

ModelPembelian.pembelianExist = async (faktur) => {
  let pembelian = await knex(TABLE).where("faktur", faktur);
  if (pembelian) {
    return pembelian[0];
  }
};

ModelPembelian.create = async (payload) => {
  await knex.transaction(async (trx) => {
    const { pemasok, item, ...pembelian } = payload;

    // menghitung harga total dari quantity
    // menyiapkan data item
    let total = 0;
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

  return payload;
};

ModelPembelian.list = async (page, limit, faktur, kodePemasok) => {
  limit = limit ? parseInt(limit) : 10;
  page = page ? parseInt(page) : 1;
  if (page < 1) page = 1;
  let offset = (page - 1) * limit;

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

ModelPembelian.get = async (faktur) => {
  let pembelian = (await knex("pembelian").where("faktur", faktur))[0];
  let pemasok = await ModelPemasok.get(pembelian.kodePemasok);
  let daftarItem = await knex("item_beli").where("faktur", pembelian.faktur);

  let payload = {
    ...pembelian,
    pemasok: pemasok[0],
    item: daftarItem,
  };
  return payload;
};

ModelPembelian.report = async (page, limit, fromTanggal, toTanggal) => {
  limit = limit ? parseInt(limit) : 10;
  page = page ? parseInt(page) : 1;
  if (page < 1) page = 1;
  let offset = (page - 1) * limit;

  let resultCount = await knex.raw(`
    SELECT count(id) as total
    FROM item_beli 
    WHERE faktur IN (
      SELECT faktur 
      FROM pembelian 
      WHERE tanggal BETWEEN '${fromTanggal}' AND '${toTanggal}' );
  `);

  let resultData = await knex.raw(
    `SELECT 
      namaBarang, kodeBarang,
      hargaBeli, SUM(jumlahBeli) jumlahBeli, 
      SUM(subtotal) as total 
    FROM item_beli 
    WHERE faktur IN (
      SELECT faktur 
      FROM pembelian 
      WHERE tanggal BETWEEN '${fromTanggal}' AND '${toTanggal}') 
    GROUP BY kodeBarang
    LIMIT ${limit}
    OFFSET ${offset};`
  );

  let resultTotal = await knex.raw(`
  SELECT SUM(total) as grandTotal FROM pembelian WHERE tanggal BETWEEN '${fromTanggal}' AND '${toTanggal}';
  `);

  // incase, ini mesti dikurangi 1 untuk mendapatkan total aslinya
  // agar tidak terjadi pagination berlebih saat next di UI FE nya.
  totalPage = Math.ceil(resultCount[0][0].total - 1 / limit);
  let prev = page - 1 > 0 ? page - 1 : null;
  let next = page + 1 > totalPage ? null : page + 1;

  return {
    pagination: {
      page,
      limit,
      next,
      prev,
    },
    resultData,
    resultTotal,
  };
};
module.exports = ModelPembelian;
