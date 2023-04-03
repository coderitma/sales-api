const express = require("express");
const router = express.Router();
const authentication = require("../middlewares/auth.middleware");
const ModelPemasok = require("../models/pemasok.model");
const { responseError } = require("../helpers/response.helpers");

router.post("/", [authentication], async (req, res) => {
  try {
    let result = await ModelPemasok.create(req);
    return res.status(201).json(result);
  } catch (error) {
    console.error(error);
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
    console.error(error);
    return responseError(res, error);
  }
});

router.get("/:kodePemasok", [authentication], async (req, res) => {
  try {
    let pemasok = await ModelPemasok.get(req);
    return res.status(200).json(pemasok);
  } catch (error) {
    console.error(error);
    return responseError(res, error);
  }
});

router.put("/:kodePemasok", [authentication], async (req, res) => {
  try {
    let pemasok = await ModelPemasok.edit(req);
    return res.status(200).json(pemasok);
  } catch (error) {
    console.error(error);
    return responseError(res, error);
  }
});

router.delete("/:kodePemasok", [authentication], async (req, res) => {
  try {
    pemasok = await ModelPemasok.delete(req);
    return res.status(204).json(pemasok);
  } catch (error) {
    console.error(error);
    return responseError(res, error);
  }
});

module.exports = router;
