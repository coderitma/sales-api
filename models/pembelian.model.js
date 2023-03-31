const { knex } = require("../config/dbsql");
const ModelPemasok = require("./pemasok.model");
var xl = require("excel4node");

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

ModelPembelian.report = async (fromTanggal, toTanggal) => {
  var wb = new xl.Workbook();
  var ws = wb.addWorksheet("Sheet 1");

  var style = wb.createStyle({
    font: {
      bold: true,
      size: 12,
    },
    numberFormat: "Rp#.##0; (Rp#.##0,00); -",
  });

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
    GROUP BY kodeBarang`
  );

  let resultTotal = await knex.raw(`
  SELECT SUM(total) as grandTotal FROM pembelian WHERE tanggal BETWEEN '${fromTanggal}' AND '${toTanggal}';
  `);

  if (resultData[0].length > 0) {
    let row = 1;
    let col = 1;
    // create header
    let headers = [
      "Kode Barang",
      "Nama Barang",
      "Harga Beli",
      "Jumlah Beli",
      "Total",
    ];
    for (const header of headers) {
      ws.cell(row, col).string(header).style(style);
      col = col + 1;
    }
    row = row + 1;

    for (const data of resultData[0]) {
      let result = Object.values(JSON.parse(JSON.stringify(data)));
      console.log(result);
      let col = 1;
      for (const r of result) {
        if (typeof r === "string") {
          ws.column(col).setWidth(r.length + 10);
          ws.cell(row, col).string(r);
        }

        if (typeof r === "number") {
          ws.column(col).setWidth(r.toString().length + 10);
          ws.cell(row, col).number(r);
        }
        col = col + 1;
      }
      row = row + 1;
    }

    ws.cell(row + 1, 1)
      .string("Grand Total")
      .style(style);
    ws.cell(row + 1, 5)
      .number(resultTotal[0][0].grandTotal)
      .style(style);
    return wb;
  } else {
    return;
  }
};
module.exports = ModelPembelian;
