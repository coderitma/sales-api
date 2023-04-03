const express = require("express");
const router = express.Router();
const authentication = require("../middlewares/auth.middleware");
const ModelReporting = require("../models/reporting.model");
const { responseError } = require("../helpers/response.helpers");

router.get("/", [authentication], async (req, res) => {
  try {
    // TODO: move pagination header to response body
    let { pagination, results } = await ModelReporting.list(req);
    pagination = JSON.stringify(pagination);
    return res.set({ pagination }).status(200).json(results);
  } catch (error) {
    return responseError(res, error, true);
  }
});

router.post("/pembelian", [authentication], async (req, res) => {
  try {
    return res.status(200).json(await ModelReporting.reportPembelian(req));
  } catch (error) {
    return responseError(res, error, true);
  }
});

router.post("/unduh", [authentication], async (req, res) => {
  try {
    return res.download(req.body.path);
  } catch (error) {
    return responseError(res, error, true);
  }
});

router.get("/:id", [authentication], async (req, res) => {
  try {
    return res.status(200).json(await ModelReporting.get(req));
  } catch (error) {
    return responseError(res, error, true);
  }
});

router.delete("/:id", [authentication], async (req, res) => {
  try {
    await ModelReporting.delete(req);
    return res.status(200).json(null);
  } catch (error) {
    return responseError(res, error, true);
  }
});

module.exports = router;
