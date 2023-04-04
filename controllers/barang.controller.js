const express = require("express");
const router = express.Router();
const authentication = require("../middlewares/auth.middleware");
const ModelBarang = require("../models/barang.model");
const { responseError } = require("../utils/helpers");

router.post("/", [authentication], async (req, res) => {
  try {
    return res.status(201).json(await ModelBarang.create(req));
  } catch (error) {
    return responseError(res, error);
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
    return responseError(res, error);
  }
});

router.get("/:kodeBarang", [authentication], async (req, res) => {
  try {
    return res.status(200).json(await ModelBarang.get(req));
  } catch (error) {
    return responseError(res, error);
  }
});

router.put("/:kodeBarang", [authentication], async (req, res) => {
  try {
    return res.status(200).json(await ModelBarang.edit(req));
  } catch (error) {
    return responseError(res, error);
  }
});

router.delete("/:kodeBarang", [authentication], async (req, res) => {
  try {
    return res.status(204).json(await ModelBarang.delete(req));
  } catch (error) {
    return responseError(res, error);
  }
});

module.exports = router;
