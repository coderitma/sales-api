const express = require("express");
const router = express.Router();
const authentication = require("../middlewares/auth.middleware");
const BarangModel = require("../models/barang.model");
const filterHelper = require("../helpers/filter.helper");

router.post("/", [authentication], async (req, res) => {
  try {
    const { kodeBarang, namaBarang, hargaBeli, hargaJual, jumlahBarang } =
      req.body;

    // Validate empty
    if (!(kodeBarang && namaBarang && hargaBeli && hargaJual && jumlahBarang)) {
      return res.status(400).json({
        message: "Data harus lengkap",
      });
    }

    // Validate kode barang unik
    const oldBarang = await BarangModel.findOne({ kodeBarang });

    if (oldBarang) {
      return res.status(400).json({
        message: `Kode barang ${kodeBarang} sudah terdaftar.`,
      });
    }

    // Validate harga
    if (hargaBeli === 0 || hargaJual === 0 || hargaJual <= hargaBeli) {
      return res.status(400).json({
        message: `Harga barang tidak valid.`,
      });
    }

    if (jumlahBarang <= 0) {
      return res.status(400).json({
        message: `Stok minimal 1 barang.`,
      });
    }

    await BarangModel({
      kodeBarang,
      namaBarang,
      hargaBeli,
      hargaJual,
      jumlahBarang,
    }).save();

    return res
      .status(201)
      .json({ kodeBarang, namaBarang, hargaBeli, hargaJual, jumlahBarang });
  } catch (error) {
    console.error(error);
  }
});

router.get("/", [authentication], async (req, res) => {
  try {
    const daftarBarang = await BarangModel.find(
      filterHelper.getCleanQueryParams(req)
    ).select({
      _id: 0,
      __v: 0,
    });
    return res.status(200).json(daftarBarang);
  } catch (error) {
    console.log(error);
  }
});

router.get("/:kodeBarang", [authentication], async (req, res) => {
  try {
    const barang = await BarangModel.findOne({
      kodeBarang: req.params.kodeBarang,
    }).select({
      _id: 0,
      __v: 0,
    });

    if (!barang) {
      return res
        .status(404)
        .json({ message: `Barang ${req.params.kodeBarang} tidak tersedia` });
    }
    return res.status(200).json(barang);
  } catch (error) {
    console.log(error);
  }
});

router.put("/:kodeBarang", [authentication], async (req, res) => {
  try {
    const kodeBarang = req.params.kodeBarang;

    const barang = await BarangModel.findOne({ kodeBarang });

    if (!barang) {
      return res
        .status(404)
        .json({ message: `Barang ${req.params.kodeBarang} tidak tersedia` });
    }

    const { namaBarang, hargaBeli, hargaJual, jumlahBarang } = req.body;

    // Validate empty
    if (!(namaBarang && hargaBeli && hargaJual && jumlahBarang)) {
      return res.status(400).json({
        message: "Data harus lengkap",
      });
    }

    // Validate harga
    if (hargaBeli === 0 || hargaJual === 0 || hargaJual <= hargaBeli) {
      return res.status(400).json({
        message: `Harga barang tidak valid.`,
      });
    }

    if (jumlahBarang <= 0) {
      return res.status(400).json({
        message: `Stok minimal 1 barang.`,
      });
    }

    await BarangModel.findOneAndUpdate(
      { kodeBarang },
      { namaBarang, hargaBeli, hargaJual, jumlahBarang }
    );
    return res
      .status(200)
      .json({ kodeBarang, namaBarang, hargaBeli, hargaJual, jumlahBarang });
  } catch (error) {
    console.log(error);
  }
});

router.delete("/:kodeBarang", [authentication], async (req, res) => {
  try {
    const kodeBarang = req.params.kodeBarang;

    const barang = await BarangModel.findOne({ kodeBarang });

    if (!barang) {
      return res
        .status(404)
        .json({ message: `Barang ${req.params.kodeBarang} tidak tersedia` });
    }

    await BarangModel.findOneAndRemove({ kodeBarang });
    return res.status(204).json();
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
