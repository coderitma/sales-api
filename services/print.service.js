const PDFDocument = require("pdfkit");
const ModelPembelian = require("../models/pembelian.model");

async function createReportPembelian(faktur, res) {
  let pembelian = await ModelPembelian.get(faktur);

  let doc = new PDFDocument({ margin: 50 });

  generateHeader(doc, pembelian);
  generateCustomerInformation(doc, pembelian);
  generateInvoiceTable(doc, pembelian);
  generateSignature(doc);

  doc.end();
  doc.pipe(res);
}

function generateHeader(doc, pembelian) {
  doc
    .fillColor("#444444")
    .fontSize(16)
    .text(pembelian.pemasok.namaPemasok, 50, 65)
    .fontSize(10)
    .text(pembelian.pemasok.alamatPemasok, 200, 65, { align: "right" })
    .text(pembelian.pemasok.teleponPemasok, 200, 80, { align: "right" })
    .moveDown();
}

function generateCustomerInformation(doc, pembelian) {
  doc.fillColor("#444444").fontSize(12).text("Faktur Pembelian", 50, 130);

  generateHr(doc, 150);

  const customerInformationTop = 160;

  doc
    .fontSize(10)
    .text("Nomor Faktur:", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .text(pembelian.faktur, 150, customerInformationTop)
    .font("Helvetica")
    .text("Tanggal Pembelian:", 50, customerInformationTop + 15)
    .text(formatDate(pembelian.tanggal), 150, customerInformationTop + 15)
    .text("Total:", 50, customerInformationTop + 30)
    .text(formatCurrency(pembelian.total), 150, customerInformationTop + 30)

    .font("Helvetica-Bold")
    .text("PT. Maju Mundur OK", 400, customerInformationTop)
    .font("Helvetica")
    .text("Jl. Kembang Goyang", 400, customerInformationTop + 15)
    .text("Jakarta" + ", " + "Indonesia", 400, customerInformationTop + 30)
    .moveDown();

  generateHr(doc, 210);
}

function generateInvoiceTable(doc, pembelian) {
  let i;
  const invoiceTableTop = 260;

  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "Kode Barang",
    "Nama Barang",
    "Harga Beli",
    "Jumlah Beli",
    "Subtotal"
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font("Helvetica");

  for (i = 0; i < pembelian.item.length; i++) {
    const item = pembelian.item[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      item.kodeBarang,
      item.namaBarang,
      formatCurrency(item.hargaBeli),
      item.jumlahBeli,
      formatCurrency(item.jumlahBeli * item.hargaBeli)
    );

    generateHr(doc, position + 20);
  }

  const subtotalPosition = invoiceTableTop + (i + 1) * 30;

  generateTableRow(
    doc,
    subtotalPosition,
    "",
    "",
    "",
    "Total",
    formatCurrency(pembelian.total)
  );
}

function generateSignature(doc) {
  doc
    .fillColor("#444444")
    .fontSize(12)
    .text("Hormat Kami,", 0, 430, { align: "right" });
  // generateHr(doc, 430 + 20);
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(2)
    .moveTo(480, 490)
    .lineTo(560, 490)
    .stroke();

  doc
    .fillColor("#444444")
    .fontSize(9)
    .text("(", 480, 500, { align: "left" })
    .text(")", 0, 500, { align: "right" });
}

function generateTableRow(
  doc,
  y,
  kodeBarang,
  namaBarang,
  hargaBeli,
  jumlahBeli,
  subtotal,
  x
) {
  doc
    .fontSize(10)
    .text(kodeBarang, 50, y)
    .text(namaBarang, 150, y)
    .text(hargaBeli, 280, y, { width: 90, align: "right" })
    .text(jumlahBeli, 370, y, { width: 90, align: "right" })
    .text(subtotal, 450, y, { width: 90, align: "right" });
}

function formatCurrency(num) {
  let n = parseInt(num).toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
  });
  return n;
}

function formatDate(date) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta",
    ...options,
  });
}

function generateHr(doc, y) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

module.exports = {
  createReportPembelian,
};
