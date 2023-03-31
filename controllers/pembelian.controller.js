const express = require("express");
const router = express.Router();
const authentication = require("../middlewares/auth.middleware");
const ModelPembelian = require("../models/pembelian.model");
const PembelianValidator = require("../validators/pembelian.validator");

router.post("/", [authentication], async (req, res) => {
  try {
    await PembelianValidator.create(req, res);
    let result = await ModelPembelian.create(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res
      .status(error.status ? error.status : 400)
      .json({
        message: error.message ? error.message : "Something when wrong!",
      });
  }
});

router.get("/", [authentication], async (req, res) => {
  try {
    let page = req.query.page;
    let limit = req.query.limit;
    let faktur = req.query.faktur;
    let kodePemasok = req.query.kodePemasok;
    let result = await ModelPembelian.list(page, limit, faktur, kodePemasok);

    return res
      .set({
        pagination: JSON.stringify(result.pagination),
      })
      .status(200)
      .json(result.results);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Bad Request" });
  }
});

router.get("/:faktur", [authentication], async (req, res) => {
  try {
    let faktur = req.params.faktur;
    let pembelian = await ModelPembelian.pembelianExist(faktur);
    if (!pembelian) {
      return res.status(404).json({ message: "404 Not Found" });
    }

    let result = await ModelPembelian.get(faktur);
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Bad Request" });
  }
});

module.exports = router;
