const express = require("express");
const router = express.Router();
const authentication = require("../middlewares/auth.middleware");
const { knex } = require("../config/dbsql");
const ModelPemasok = require("../models/pemasok.model");

router.post("/", [authentication], async (req, res) => {
  try {
    let result = await ModelPemasok.create(req.body);
    return res.status(201).json(result);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Bad Request" });
  }
});

router.get("/", [authentication], async (req, res) => {
  try {
    let page = req.query.page;
    let kodePemasok = req.query.kodePemasok;
    let namaPemasok = req.query.namaPemasok;
    let result = await ModelPemasok.list(page, 3, kodePemasok, namaPemasok);

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

router.get("/:kodePemasok", [authentication], async (req, res) => {
  try {
    let kodePemasok = req.params.kodePemasok;
    let pemasok = await ModelPemasok.pemasokExist(kodePemasok);
    if (!pemasok) {
      return res.status(404).json({ message: "404 Not Found" });
    }
    return res.status(200).json(pemasok);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Bad Request" });
  }
});

router.put("/:kodePemasok", [authentication], async (req, res) => {
  try {
    let kodePemasok = req.params.kodePemasok;
    let pemasok = await ModelPemasok.pemasokExist(kodePemasok);
    if (!pemasok) {
      return res.status(404).json({ message: "404 Not Found" });
    }

    pemasok = await ModelPemasok.edit(kodePemasok, req.body);
    return res.status(200).json(pemasok);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Bad Request" });
  }
});

router.delete("/:kodePemasok", [authentication], async (req, res) => {
  try {
    let kodePemasok = req.params.kodePemasok;
    let pemasok = await ModelPemasok.pemasokExist(kodePemasok);
    if (!pemasok) {
      return res.status(404).json({ message: "404 Not Found" });
    }

    pemasok = await ModelPemasok.delete(kodePemasok);
    return res.status(204).json(pemasok);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Bad Request" });
  }
});

module.exports = router;
