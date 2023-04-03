const express = require("express");
const router = express.Router();
const authentication = require("../middlewares/auth.middleware");
const ModelBarang = require("../models/barang.model");

router.post("/", [authentication], async (req, res) => {
  try {
    let result = await ModelBarang.create(req);
    return res.status(201).json(result);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Bad Request" });
  }
});

router.get("/", [authentication], async (req, res) => {
  try {
    let result = await ModelBarang.list(req);
    return res
      .set({ pagination: JSON.stringify(result.pagination) })
      .status(200)
      .json(result.results);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Bad Request" });
  }
});

router.get("/:kodeBarang", [authentication], async (req, res) => {
  try {
    let kodeBarang = req.params.kodeBarang;
    let barang = await ModelBarang.barangExist(kodeBarang);

    if (!barang) {
      return res.status(404).json({ message: "404 Not Found" });
    }
    return res.status(200).json(barang);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Bad Request" });
  }
});

router.put("/:kodeBarang", [authentication], async (req, res) => {
  try {
    let kodeBarang = req.params.kodeBarang;
    let barang = await ModelBarang.barangExist(kodeBarang);

    if (!barang) {
      return res.status(404).json({ message: "404 Not Found" });
    }

    barang = await ModelBarang.edit(kodeBarang, req.body);
    return res.status(200).json(barang);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Bad Request" });
  }
});

router.delete("/:kodeBarang", [authentication], async (req, res) => {
  try {
    let kodeBarang = req.params.kodeBarang;
    let barang = await ModelBarang.barangExist(kodeBarang);

    if (!barang) {
      return res.status(404).json({ message: "404 Not Found" });
    }

    barang = await ModelBarang.delete(kodeBarang);
    return res.status(204).json(barang);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Bad Request" });
  }
});

module.exports = router;
