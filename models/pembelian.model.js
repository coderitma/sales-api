const { knex } = require("../config/dbsql");

const list = async () => {
  try {
    let daftarPembelian = await knex("pembelian").select();
    let payload = [];
    for (let pembelian of daftarPembelian) {
      let data = {
        faktur: pembelian.faktur,
        tanggal: pembelian.tanggal,
        total: pembelian.total,
        pemasok: {},
        item: [],
      };

      let pemasok = (
        await knex("pemasok")
          .where("kodePemasok", pembelian.kodePemasok)
          .select()
      )[0];

      data.pemasok = {
        kodePemasok: pemasok.kodePemasok,
        namaPemasok: pemasok.namaPemasok,
        alamatPemasok: pemasok.alamatPemasok,
        teleponPemasok: pemasok.teleponPemasok,
      };

      let daftarItem = await knex("item_beli").where(
        "faktur",
        pembelian.faktur
      );
      for (let item of daftarItem) {
        data.item.push({
          kodeBarang: item.kodeBarang,
          namaBarang: item.namaBarang,
          hargaBeli: item.hargaBeli,
          hargaJual: item.hargaJual,
          jumlahBeli: item.jumlahBeli,
        });
      }

      payload.push(data);
    }

    return payload;
  } catch (error) {
    throw error;
  }
};

const ModelPembelian = {
  list,
};
module.exports = ModelPembelian;
