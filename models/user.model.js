var bcrypt = require("bcryptjs");

const {
  setResponseError,
  STATUS_CODE_404,
  STATUS_CODE_401,
} = require("../utils/helpers");
const dbmaria = require("../utils/dbmaria");

const TABLE = "user";
const ModelUser = {};

ModelUser.userExist = async (email) => {
  let user = await dbmaria(TABLE).where("email", email);
  if (user) {
    return user[0];
  }
};

ModelUser.get = async (req, noCheck) => {
  const { email } = req.body;
  let user = (await dbmaria("user").where("email", email))[0];

  if (!user && !noCheck)
    throw setResponseError(STATUS_CODE_401, "User tidak tersedia");

  return user;
};

ModelUser.checkPasswordAndGetUser = async (req) => {
  let { password } = req.body;
  let user = await ModelUser.get(req);
  if (!(await bcrypt.compare(password, user.password)))
    throw setResponseError(STATUS_CODE_401, "Password tidak tepat");

  return user;
};

ModelUser.create = async (req) => {
  const { firstName, lastName, email, password } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  await dbmaria(TABLE).insert({
    firstName,
    lastName,
    email,
    password: passwordHash,
  });

  return { firstName, lastName, email };
};

module.exports = ModelUser;
