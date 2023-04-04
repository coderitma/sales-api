const express = require("express");
const router = express.Router();
const authentication = require("../middlewares/auth.middleware");
const ModelReporting = require("../models/reporting.model");
const { responseError } = require("../utils/helpers");

router.get("/", [authentication], async (req, res) => {
  try {
    // TODO: move pagination header to response body
    let { pagination, results } = await ModelReporting.list(req);
    pagination = JSON.stringify(pagination);
    return res.set({ pagination }).status(200).json(results);
  } catch (error) {
    return responseError(res, error);
  }
});

router.post("/pembelian", [authentication], async (req, res) => {
  try {
    return res.status(200).json(await ModelReporting.reportPembelian(req));
  } catch (error) {
    return responseError(res, error);
  }
});

router.post("/unduh", [authentication], async (req, res) => {
  try {
    return res.download(req.body.path);
  } catch (error) {
    return responseError(res, error);
  }
});

router.get("/:id", [authentication], async (req, res) => {
  try {
    return res.status(200).json(await ModelReporting.get(req));
  } catch (error) {
    return responseError(res, error);
  }
});

router.delete("/:id", [authentication], async (req, res) => {
  try {
    return res.status(200).json(await ModelReporting.delete(req));
  } catch (error) {
    return responseError(res, error);
  }
});

module.exports = router;
