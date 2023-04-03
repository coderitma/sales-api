const { knex } = require("../config/dbsql");
const { pageLimitOffset, prevNext } = require("../helpers/pagination.helper");
const {
  setResponseError,
  STATUS_CODE_404,
} = require("../helpers/response.helpers");
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

ModelPembelian.report = async (req) => {
  let { fromTanggal, toTanggal } = req.body;
  let filePath = `reporting`;
  let filename = `${new Date().getTime()}.xlsx`;
  let writeFileLocation = `${filePath}/${filename}`;
  let url = `${req.protocol}://${req.get("host")}/${writeFileLocation}`;
  let row = 1;
  let col = 1;
  let wb = new xl.Workbook();
  let ws = wb.addWorksheet("Sheet 1");
  let style = wb.createStyle({
    font: { bold: true, size: 12 },
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
      WHERE tanggal 
      BETWEEN '${fromTanggal}' AND '${toTanggal}'
    ) 
    GROUP BY kodeBarang`
  );

  let resultTotal = await knex.raw(`
    SELECT SUM(total) as grandTotal 
    FROM pembelian WHERE tanggal 
    BETWEEN '${fromTanggal}' AND '${toTanggal}';
  `);

  if (resultData[0].length === 0) throw setResponseError(STATUS_CODE_404);

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

  // Create data
  for (const data of resultData[0]) {
    let result = Object.values(JSON.parse(JSON.stringify(data)));
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

  wb.write(writeFileLocation);
  return { url };
};

module.exports = ModelPembelian;
