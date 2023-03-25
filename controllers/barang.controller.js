const express = require("express");
const router = express.Router();
const authentication = require("../middlewares/auth.middleware");
const { knex } = require("../config/dbsql");

const getBarang = async (kodeBarang) => {
  const barang = await knex("barang").where("kodeBarang", kodeBarang);
  return barang;
};

const barangExist = async ({ kodeBarang }) => {
  const barang = await getBarang(kodeBarang);
  if (barang.length === 0) {
    return false;
  }

  return true;
};

router.post("/", [authentication], async (req, res) => {
  try {
    await knex("barang").insert(req.body);
    return res.status(201).json(req.body);
  } catch (error) {
    return res.status(400).json({ message: error.sqlMessage });
  }
});

router.get("/", [authentication], async (req, res) => {
  try {
    let daftarBarang = await knex.select().from("barang");
    return res.status(200).json(daftarBarang);
  } catch (error) {
    return res.status(400).json(error);
  }
});

router.get("/:kodeBarang", [authentication], async (req, res) => {
  try {
    if (!(await barangExist(req.params))) {
      return res.status(404).json({ message: "404 not found" });
    }
    return res.status(200).json(barang[0]);
  } catch (error) {
    return res.status(400).json(error);
  }
});

router.put("/:kodeBarang", [authentication], async (req, res) => {
  try {
    if (!(await barangExist(req.params))) {
      return res.status(404).json({ message: "404 not found" });
    }

    await knex("barang")
      .where("kodeBarang", req.params.kodeBarang)
      .update({ ...req.body });
    return res.status(200).json(req.body);
  } catch (error) {
    return res.status(400).json(error);
  }
});

router.delete("/:kodeBarang", [authentication], async (req, res) => {
  try {
    if (!(await barangExist(req.params))) {
      return res.status(404).json({ message: "404 not found" });
    }
    await knex("barang").where({ kodeBarang: req.params.kodeBarang }).del();
    return res.status(204).json();
  } catch (error) {
    return res.status(400).json(error);
  }
});

module.exports = router;
