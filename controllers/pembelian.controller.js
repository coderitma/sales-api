const express = require("express");
const router = express.Router();
const authentication = require("../middlewares/auth.middleware");
const ModelPembelian = require("../models/pembelian.model");
const ServicePembelian = require("../services/pembelian.service");
// const PembelianValidator = require("../validators/pembelian.validator");
const { responseError } = require("../utils/helpers");

router.post("/", [authentication], async (req, res) => {
  try {
    // TODO: fix validation PembelianValidator.create
    // await PembelianValidator.create(req, res);
    return res.status(201).json(await ModelPembelian.create(req));
  } catch (error) {
    return responseError(res, error);
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
    return responseError(res, error);
  }
});

router.get("/:faktur", [authentication], async (req, res) => {
  try {
    return res.status(200).json(await ModelPembelian.get(req));
  } catch (error) {
    return responseError(res, error);
  }
});

router.post("/:faktur/print/excel", [authentication], async (req, res) => {
  try {
    let pembelian = await ModelPembelian.get(req);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${pembelian.faktur}_${new Date().getTime()}.xlsx`
    );
    return ServicePembelian.fakturToExcel(pembelian, res).then(() => {
      res.status(200).end();
    });
  } catch (error) {
    return responseError(res, error);
  }
});

router.post("/report/excel", [authentication], async (req, res) => {
  try {
    // TODO: add ModelPembelian.pullByPeriod(req);
    // TODO: ServicePembelian.convertToExcel(result);
    return res.status(200).json(await ModelPembelian.pullByDate(req));
  } catch (error) {
    return responseError(res, error);
  }
});

module.exports = router;
