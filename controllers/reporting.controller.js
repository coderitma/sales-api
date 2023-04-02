const express = require("express");
const router = express.Router();
const authentication = require("../middlewares/auth.middleware");
const ModelReporting = require("../models/reporting.model");

router.get("/", [authentication], async (req, res) => {
  try {
    let results = await ModelReporting.list(req);
    return res
      .set({
        pagination: JSON.stringify(results.pagination),
      })
      .status(200)
      .json(results.results);
  } catch (error) {
    return res
      .status(error.status || 400)
      .json({ message: error.message || "Something when wrong" });
  }
});

router.post("/pembelian", [authentication], async (req, res) => {
  try {
    let result = await ModelReporting.reportPembelian(req);
    if (result) {
      return res.status(200).json(result);
    }
    throw { message: "Not Found", status: 404 };
  } catch (error) {
    return res
      .status(error.status || 400)
      .json({ message: error.message || "Something when wrong" });
  }
});

router.post("/unduh", [authentication], async (req, res) => {
  try {
    const file = `${req.body.path}`;
    return res.download(file);
  } catch (error) {
    return res
      .status(error.status || 400)
      .json({ message: error.message || "Something when wrong" });
  }
});

router.get("/:id", [authentication], async (req, res) => {
  try {
    let result = await ModelReporting.get(req);
    return res.status(200).json(result);
  } catch (error) {
    return res
      .status(error.status || 400)
      .json({ message: error.message || "Something when wrong" });
  }
});

router.delete("/:id", [authentication], async (req, res) => {
  try {
    let result = await ModelReporting.delete(req);
    return res.status(200).json(result);
  } catch (error) {
    return res
      .status(error.status || 400)
      .json({ message: error.message || "Something when wrong" });
  }
});

module.exports = router;
