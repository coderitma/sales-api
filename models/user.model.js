var bcrypt = require("bcryptjs");
const { knex } = require("../config/dbsql");
const {
  setResponseError,
  STATUS_CODE_404,
  STATUS_CODE_401,
} = require("../utils/helpers");

const TABLE = "user";
const ModelUser = {};

ModelUser.userExist = async (email) => {
  let user = await knex(TABLE).where("email", email);
  if (user) {
    return user[0];
  }
};

ModelUser.get = async (req) => {
  const { email } = req.body;
  let user = (await knex("user").where("email", email))[0];

  if (!user) throw setResponseError(STATUS_CODE_404);

  return user;
};

ModelUser.checkPasswordAndGetUser = async (req) => {
  let { password } = req.body;
  let user = await ModelUser.get(req);
  if (!(await bcrypt.compare(password, user.password)))
    throw setResponseError(STATUS_CODE_401);
};

ModelUser.create = async (req) => {
  const { firstName, lastName, email, password } = req.body;
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
