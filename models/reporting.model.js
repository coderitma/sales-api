const { knex } = require("../config/dbsql");
var xl = require("excel4node");
const fs = require("fs");
const TABLE = "reporting";
const ModelReporting = {};
const JENIS = {
  PEMBELIAN: "pembelian",
  BARANG: "barang",
  PEMASOK: "pemasok",
};

ModelReporting.list = async (req) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 10;
  let page = req.query.page ? parseInt(req.query.page) : 1;
  let jenis = req.query.jenis;

  if (page < 1) page = 1;
  let offset = (page - 1) * limit;

  let qb = knex("reporting");
  let qbCount = knex("reporting");

  qb = qb.whereLike("email", `%${req.user.email}%`);
  qbCount = qbCount.whereLike("email", `%${req.user.email}%`);

  if (jenis) {
    qb = qb.whereLike("jenis", `%${jenis}%`);
    qbCount = qbCount.whereLike("jenis", `%${jenis}%`);
  }

  let totalData = await qbCount.count("* as count").first();
  let results = await qb.limit(limit).offset(offset);

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

ModelReporting.get = async (req) => {
  const { user, params } = req;
  let reporting = await knex("reporting").where({
    id: params.id,
    email: user.email,
  });

  if (reporting.length === 0) {
    throw { message: "report not found", status: 404 };
  }

  return reporting;
};

ModelReporting.delete = async (req) => {
  const { user, params } = req;

  let reporting = await knex("reporting").where({
    id: params.id,
    email: user.email,
  });

  if (reporting.length === 0) {
    throw { message: "report not found", status: 404 };
  }

  fs.unlink(reporting[0].path, async (err) => {
    if (err) {
      throw { message: "File tidak ada untuk dihapus", status: 400 };
    }
    await knex("reporting")
      .where({
        id: params.id,
        email: user.email,
      })
      .delete();
  });

  return;
};

ModelReporting.reportPembelian = async (req) => {
  let { fromTanggal, toTanggal, kodeBarang } = req.body;

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
    WHERE ((kodeBarang LIKE '%${kodeBarang}%') AND
    (faktur IN (
      SELECT faktur 
      FROM pembelian 
      WHERE tanggal BETWEEN '${fromTanggal}' AND '${toTanggal}') 
      ))
    GROUP BY kodeBarang`
  );

  let resultTotal = await knex.raw(`
    SELECT SUM(total) as grandTotal 
    FROM pembelian WHERE tanggal 
    BETWEEN '${fromTanggal}' AND '${toTanggal}';
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

    let filePath = `reporting`;
    let alias = "reports";
    let filename = `${new Date().getTime()}.xlsx`;
    let url = `${req.protocol}://${req.get("host")}/${alias}/${filename}`;

    wb.write(`${filePath}/${filename}`);

    let payload = {
      email: req.user.email,
      jenis: JENIS.PEMBELIAN,
      path: `./${filePath}/${filename}`,
      link: url,
    };

    await knex(TABLE).insert(payload);

    return payload;
  }
};

module.exports = ModelReporting;
