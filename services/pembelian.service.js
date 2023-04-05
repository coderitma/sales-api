const excel = require("exceljs");
ServicePembelian = {};

ServicePembelian.fakturToExcel = (pembelian, res) => {
  let alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  const wb = new excel.Workbook();
  const ws = wb.addWorksheet("Faktur");

  ws.getCell("A1").font = { family: 4, size: 10, bold: true };
  ws.getCell("A2").font = { family: 4, size: 10, bold: true };
  ws.getCell("D1").font = { family: 4, size: 10, bold: true };

  ws.getCell("A1").value = "FAKTUR NO.";
  ws.getCell("B1").value = pembelian.faktur;
  ws.getCell("A2").value = "TANGGAL";
  ws.getCell("B2").value = pembelian.tanggal.toISOString().split("T")[0];

  // Create supplier
  ws.getCell("D1").value = "KODE PEMASOK";
  ws.getCell("D2").value = pembelian.kodePemasok;

  let row = 4;
  let isHeader = true;
  for (let item of pembelian.item) {
    let itemArrayObject = JSON.parse(JSON.stringify(item));

    if (isHeader) {
      ws.getRow(row).style.alignment = alignment;
      ws.getRow(row).font = { family: 4, size: 10, bold: true };
      ws.getRow(row).width = 60;
      isHeader = false;
      ws.getRow(row).values = Object.keys(itemArrayObject).map((value) => {
        if (value instanceof Date) {
          return value.toISOString().split("T")[0];
        }

        return value.toUpperCase();
      });
      row++;
    }

    ws.getRow(row).style.alignment = alignment;
    ws.getRow(row).values = Object.values(itemArrayObject);
    row++;
  }

  ws.getCell(`D${row}`).font = { family: 4, size: 10, bold: true };
  ws.getCell(`E${row}`).font = { family: 4, size: 10, bold: true };
  ws.getCell(`D${row}`).style.alignment = alignment;
  ws.getCell(`E${row}`).style.alignment = alignment;
  ws.getCell(`D${row}`).value = "TOTAL PEMBELIAN";
  ws.getCell(`E${row}`).value = pembelian.total;

  ws.columns.forEach((column) => {
    console.log(column.values);
    const lengths = column.values.map((v) => v.toString().length);
    const maxLength = Math.max(...lengths.filter((v) => typeof v === "number"));
    column.width = maxLength + 2;
  });

  return wb.xlsx.write(res);
};

module.exports = ServicePembelian;
