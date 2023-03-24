const express = require("express");
const router = express.Router();
const authentication = require("../middlewares/auth.middleware");
const PemasokModel = require("../models/pemasok.model");
const filterHelper = require("../helpers/filter.helper");

router.post("/", [authentication], async (req, res) => {
  try {
    const { kodePemasok, namaPemasok, alamatPemasok, teleponPemasok } =
      req.body;

    // Validate empty
    if (!(kodePemasok && namaPemasok && alamatPemasok && teleponPemasok)) {
      return res.status(400).json({
        message: "Data harus lengkap",
      });
    }

    // Validate kode pemasok unik
    const oldPemasok = await PemasokModel.findOne({ kodePemasok });

    if (oldPemasok) {
      return res.status(400).json({
        message: `Kode pemasok ${kodePemasok} sudah terdaftar.`,
      });
    }

    await PemasokModel({
      kodePemasok,
      namaPemasok,
      alamatPemasok,
      teleponPemasok,
    }).save();

    return res
      .status(201)
      .json({ kodePemasok, namaPemasok, alamatPemasok, teleponPemasok });
  } catch (error) {
    console.error(error);
  }
});

router.get("/", [authentication], async (req, res) => {
  try {
    const daftarPemasok = await PemasokModel.find(
      filterHelper.getCleanQueryParams(req)
    ).select({
      _id: 0,
      __v: 0,
    });
    return res.status(200).json(daftarPemasok);
  } catch (error) {
    console.log(error);
  }
});

router.get("/:kodePemasok", [authentication], async (req, res) => {
  try {
    const pemasok = await PemasokModel.findOne({
      kodePemasok: req.params.kodePemasok,
    }).select({
      _id: 0,
      __v: 0,
    });

    if (!pemasok) {
      return res
        .status(404)
        .json({ message: `Pemasok ${req.params.kodePemasok} tidak tersedia` });
    }
    return res.status(200).json(pemasok);
  } catch (error) {
    console.log(error);
  }
});

router.put("/:kodePemasok", [authentication], async (req, res) => {
  try {
    const kodePemasok = req.params.kodePemasok;
    const pemasok = await PemasokModel.findOne({ kodePemasok });

    if (!pemasok) {
      return res
        .status(404)
        .json({ message: `Barang ${req.params.kodePemasok} tidak tersedia` });
    }

    const { namaPemasok, alamatPemasok, teleponPemasok } = req.body;

    await PemasokModel.findOneAndUpdate(
      { kodePemasok },
      { namaPemasok, alamatPemasok, teleponPemasok }
    );
    return res.status(200).json({ namaPemasok, alamatPemasok, teleponPemasok });
  } catch (error) {
    console.log(error);
  }
});

router.delete("/:kodePemasok", [authentication], async (req, res) => {
  try {
    const kodePemasok = req.params.kodePemasok;

    const pemasok = await PemasokModel.findOne({ kodePemasok });

    if (!pemasok) {
      return res
        .status(404)
        .json({ message: `Pemaosk ${kodePemasok} tidak tersedia` });
    }

    await PemasokModel.findOneAndRemove({ kodePemasok });
    return res.status(204).json();
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
