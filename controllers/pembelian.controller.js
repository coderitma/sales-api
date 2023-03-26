const express = require("express");
const router = express.Router();
const authentication = require("../middlewares/auth.middleware");
const PembelianModel = require("../models/pembelian.model");
const { knex } = require("../config/dbsql");
const ModelPembelian = require("../models/pembelian.model");

router.post("/", [authentication], async (req, res) => {
  try {
    await knex.transaction(async (trx) => {
      const { pemasok, item, ...pembelian } = req.body;

      // menghitung harga total dari quantity
      // menyiapkan data item
      let total = 0;
      let dataInsertItemBeli = [];
      for (let i = 0; i < item.length; i++) {
        total += item[i].hargaBeli * item[i].jumlahBeli;
        let temp = {
          faktur: pembelian.faktur,
          kodeBarang: item[i].kodeBarang,
          namaBarang: item[i].namaBarang,
          hargaBeli: item[i].hargaBeli,
          hargaJual: item[i].hargaJual,
          jumlahBeli: item[i].jumlahBeli,
          subtotal: item[i].hargaBeli * item[i].jumlahBeli,
        };
        dataInsertItemBeli.push(temp);
      }

      // menyimpan pembelian
      await knex("pembelian").transacting(trx).insert({
        faktur: pembelian.faktur,
        tanggal: pembelian.tanggal,
        total: total,
        kodePemasok: pemasok.kodePemasok,
      });

      await knex("item_beli")
        .transacting(trx)
        .insert([...dataInsertItemBeli]);

      // update stock
      for (let i = 0; i < item.length; i++) {
        let data = await knex("barang")
          .where("kodeBarang", item[i].kodeBarang)
          .select();
        await knex("barang")
          .transacting(trx)
          .where("kodeBarang", item[i].kodeBarang)
          .update("jumlahBarang", data[0].jumlahBarang - item[i].jumlahBeli);
      }
    });

    return res.status(201).json(req.body);
  } catch (error) {
    return res.status(400).json(error);
  }
});

router.get("/", [authentication], async (req, res) => {
  try {
    let daftarPembelian = await ModelPembelian.list();
    return res.status(200).json(daftarPembelian);
  } catch (error) {
    console.error(error);
  }
});

router.get("/:faktur", [authentication], async (req, res) => {
  try {
    const pembelian = await PembelianModel.findOne({
      faktur: req.params.faktur,
    }).select({
      _id: 0,
      __v: 0,
    });

    if (!pembelian) {
      return res
        .status(404)
        .json({ message: `Faktur ${req.params.faktur} tidak tersedia` });
    }
    return res.status(200).json(pembelian);
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
