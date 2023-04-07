const express = require("express");
const router = express.Router();
const authentication = require("../middlewares/auth.middleware");
const ModelPemasok = require("../models/pemasok.model");
const { responseError } = require("../utils/helpers");
const PemasokValidator = require("../validators/pemasok.validator");

router.post("/", [authentication], async (req, res) => {
  try {
    await PemasokValidator.create(req);
    return res.status(201).json(await ModelPemasok.create(req));
  } catch (error) {
    return responseError(res, error);
  }
});

router.get("/", [authentication], async (req, res) => {
  try {
    let result = await ModelPemasok.list(req);

    return res
      .set({
        pagination: JSON.stringify(result.pagination),
        link: JSON.stringify(result.pagination),
      })
      .status(200)
      .json(result.results);
  } catch (error) {
    return responseError(res, error);
  }
});

router.get("/:kodePemasok", [authentication], async (req, res) => {
  try {
    return res.status(200).json(await ModelPemasok.get(req));
  } catch (error) {
    return responseError(res, error);
  }
});

router.put("/:kodePemasok", [authentication], async (req, res) => {
  try {
    await PemasokValidator.edit(req);
    return res.status(200).json(await ModelPemasok.edit(req));
  } catch (error) {
    return responseError(res, error);
  }
});

router.delete("/:kodePemasok", [authentication], async (req, res) => {
  try {
    return res.status(204).json(await ModelPemasok.delete(req));
  } catch (error) {
    return responseError(res, error);
  }
});

module.exports = router;
