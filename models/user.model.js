var bcrypt = require("bcryptjs");
const { knex } = require("../config/dbsql");

const TABLE = "user";
const ModelUser = {};

ModelUser.userExist = async (email) => {
  let user = await knex(TABLE).where("email", email);
  if (user) {
    return user[0];
  }
};

ModelUser.create = async (firstName, lastName, email, password) => {
  const passwordHash = await bcrypt.hash(password, 10);
  await knex(TABLE).insert({
    firstName,
    lastName,
    email,
    password: passwordHash,
  });

  return { firstName, lastName, email };
};

module.exports = ModelUser;
