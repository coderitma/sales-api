const express = require("express");
const router = express.Router();
const authentication = require("../middlewares/auth.middleware");
const ModelPembelian = require("../models/pembelian.model");
// const PembelianValidator = require("../validators/pembelian.validator");
const { responseError } = require("../helpers/response.helpers");

router.post("/", [authentication], async (req, res) => {
  try {
    // TODO: fix validation PembelianValidator.create
    // await PembelianValidator.create(req, res);
    let result = await ModelPembelian.create(req);
    return res.status(201).json(result);
  } catch (error) {
    return responseError(res, error, true);
  }
});

router.get("/", [authentication], async (req, res) => {
  try {
    let result = await ModelPembelian.list(req);
    return res
      .set({
        pagination: JSON.stringify(result.pagination),
      })
      .status(200)
      .json(result.results);
  } catch (error) {
    return responseError(res, error, true);
  }
});

router.get("/:faktur", [authentication], async (req, res) => {
  try {
    let result = await ModelPembelian.get(req);
    return res.status(200).json(result);
  } catch (error) {
    return responseError(res, error, true);
  }
});

module.exports = router;
