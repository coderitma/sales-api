const STATUS_CODE_400 = 400;
const STATUS_CODE_404 = 404;
const STATUS_CODE_401 = 401;

const pageLimitOffset = (req) => {
  let { limit, page } = req.query;

  limit = limit ? parseInt(limit) : 10;
  page = page ? parseInt(page) : 1;

  if (page < 1) page = 1;
  let offset = (page - 1) * limit;

  return { limit, page, offset };
};

const prevNext = (count, limit, page) => {
  let totalPage = Math.ceil(count / limit);
  let prev = page - 1 > 0 ? page - 1 : null;
  let next = page + 1 > totalPage ? null : page + 1;

  return { prev, next, totalPage };
};

const MESSAGE_404 = "Resource not found";
const MESSAGE_400 =
  "Bad request. Something happened, like invalid data and so on.";
const MESSAGE_401 =
  "You cannot continue the request. Authentication is required.";
const MESSAGE_ALT =
  "Something has happened. Ask the developer's help to handle it.";

const responseError = (res, error, logging = false) => {
  if (logging) console.log(error);

  let messageAlternative = "Something when wrong!";
  let status = error.status ? error.status : 400;
  let message = error.message ? error.message : messageAlternative;
  return res.status(status).json({ message });
};

const setResponseError = (status = 400, message = "") => {
  switch (status) {
    case 400:
      return { message: message || MESSAGE_400, status };
    case 401:
      return { message: message || MESSAGE_401, status };
    case 404:
      return { message: message || MESSAGE_404, status };
    default:
      return { message: message || MESSAGE_ALT, status };
  }
};

module.exports = {
  responseError,
  setResponseError,
  STATUS_CODE_400,
  STATUS_CODE_401,
  STATUS_CODE_404,
  pageLimitOffset,
  prevNext,
};
