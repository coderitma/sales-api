const express = require("express");
const ModelPembelian = require("../models/pembelian.model");
const router = express.Router();
const authentication = require("../middlewares/auth.middleware");

router.get("/pembelian", [authentication], async (req, res) => {
  try {
    let fromTanggal = req.query.fromTanggal;
    let toTanggal = req.query.toTanggal;
    let result = await ModelPembelian.report(fromTanggal, toTanggal);
    if (result) {
      result.write(`${new Date().getTime()}.xlsx`, res);
    }
    throw { message: "Not Found", status: 404 };
  } catch (error) {
    console.error(error);
    return res
      .status(error.status || 400)
      .json({ message: error.message || "Something when wrong" });
  }
});

module.exports = router;
