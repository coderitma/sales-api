const express = require("express");
const router = express.Router();
const authentication = require("../middlewares/auth.middleware");
const { knex } = require("../config/dbsql");

const pemasokExist = async ({ kodePemasok }) => {
  const pemasok = await knex("pemasok").where("kodePemasok", kodePemasok);
  if (pemasok.length === 0) {
    return false;
  }

  return pemasok;
};

router.post("/", [authentication], async (req, res) => {
  try {
    await knex("pemasok").insert(req.body);
    return res.status(201).json(req.body);
  } catch (error) {
    return res.status(400).json({ message: error.sqlMessage });
  }
});

router.get("/", [authentication], async (req, res) => {
  try {
    const daftarPemasok = await knex.select().from("pemasok");
    return res.status(200).json(daftarPemasok);
  } catch (error) {
    return res.status(400).json(error);
  }
});

router.get("/:kodePemasok", [authentication], async (req, res) => {
  try {
    const pemasok = await pemasokExist(req.params);
    if (!pemasok) {
      return res.status(404).json({ message: "404 not found" });
    }
    return res.status(200).json(pemasok[0]);
  } catch (error) {
    return res.status(400).json(error);
  }
});

router.put("/:kodePemasok", [authentication], async (req, res) => {
  try {
    const pemasok = await pemasokExist(req.params);
    if (!pemasok) {
      return res.status(404).json({ message: "404 not found" });
    }

    await knex("pemasok")
      .where("kodePemasok", req.params.kodePemasok)
      .update({ ...req.body });
    return res.status(200).json(req.body);
  } catch (error) {
    return res.status(400).json(error);
  }
});

router.delete("/:kodePemasok", [authentication], async (req, res) => {
  try {
    const pemasok = await pemasokExist(req.params);
    if (!pemasok) {
      return res.status(404).json({ message: "404 not found" });
    }
    await knex("pemasok").where({ kodePemasok: req.params.kodePemasok }).del();
    return res.status(204).json();
  } catch (error) {
    return res.status(400).json(error);
  }
});

module.exports = router;
