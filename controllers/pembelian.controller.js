const express = require("express");
const router = express.Router();
const authentication = require("../middlewares/auth.middleware");
const PembelianModel = require("../models/pembelian.model");
const PemasokModel = require("../models/pemasok.model");
const BarangModel = require("../models/barang.model");

router.post("/", [authentication], async (req, res) => {
  try {
    const { pemasok, item, ...pembelian } = req.body;

    // validasi faktur
    if (!pembelian.faktur) {
      return res.status(400).json({
        message: "Faktur tidak boleh kosong",
      });
    }

    // validasi unik nomor faktur (ketersediaan pembelian)
    const oldPembelian = await PembelianModel.findOne({
      faktur: pembelian.faktur,
    });

    if (oldPembelian) {
      return res.status(400).json({
        message: "Faktur sudah ada sebelumnya",
      });
    }

    // validasi pemasok
    if (!pemasok) {
      return res.status(400).json({
        message: "Pemasok tidak boleh kosong",
      });
    }

    // validasi ada atau tidaknya pemasok di db
    const pemasokTersedia = await PemasokModel.findOne({
      kodePemasok: pemasok.kodePemasok,
    });

    if (!pemasokTersedia) {
      return res.status(404).json({
        message: "Pemasok tidak terdaftar",
      });
    }

    // validasi item
    if (!item || item.length <= 0) {
      return res.status(400).json({
        message: "Item tidak boleh kosong",
      });
    }

    const daftarBarang = await BarangModel.find()
      .where("kodeBarang")
      .in(item.map((i) => i.kodeBarang));

    if (!daftarBarang || daftarBarang.length !== item.length) {
      return res.status(400).json({
        message: `Daftar barang ada yang tidak tersedia`,
      });
    }

    let validasiTotal = 0;
    let validasiJumlah = true;
    let indexBarang = 0;
    for (barang of item) {
      validasiTotal += barang.hargaBeli * barang.jumlahBarang;
      if (
        daftarBarang[indexBarang].kodeBarang === barang.kodeBarang &&
        daftarBarang[indexBarang].jumlahBarang < barang.jumlahBarang
      ) {
        validasiJumlah = false;
      }

      indexBarang++;
    }

    if (validasiTotal !== pembelian.total) {
      return res.status(400).json({
        message: `Total pembelian tidak valid`,
      });
    }

    if (!validasiJumlah) {
      return res.status(400).json({
        message: `Jumlah pesanan ada yang melebihi batas`,
      });
    }

    let d = new Date(pembelian.tanggal);
    pembelian.tanggal = d.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });

    await PembelianModel({
      item: [...item],
      ...pembelian,
      pemasok: { ...pemasok },
    }).save();

    // update stock
    for (let b of item) {
      await BarangModel.findOneAndUpdate(
        { kodeBarang: b.kodeBarang },
        { $inc: { jumlahBarang: -parseInt(b.jumlahBarang) } }
      );
    }
    console.log(item);

    return res.status(201).json({
      item: [...item],
      ...pembelian,
      pemasok: { ...pemasok },
    });
  } catch (error) {
    console.error(error);
  }
});

router.get("/", [authentication], async (req, res) => {
  try {
    const querySearch = req.query ? req.query : {};
    const daftarPembelian = await PembelianModel.find(querySearch).select({
      _id: 0,
      __v: 0,
    });
    return res.status(200).json(daftarPembelian);
  } catch (error) {
    console.error(error);
  }
});

router.get("/:faktur", [authentication], async (req, res) => {
  try {
    const pembelian = await PembelianModel.findOne({
      faktur: req.params.faktur,
    }).select({
      _id: 0,
      __v: 0,
    });

    if (!pembelian) {
      return res
        .status(404)
        .json({ message: `Faktur ${req.params.faktur} tidak tersedia` });
    }
    return res.status(200).json(pembelian);
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
