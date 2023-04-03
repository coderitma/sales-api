const MESSAGE_404 = "Resource not found";
const MESSAGE_400 =
  "Bad request. Something happened, like invalid data and so on.";
const MESSAGE_401 =
  "You cannot continue the request. Authentication is required.";
const MESSAGE_ALT =
  "Something has happened. Ask the developer's help to handle it.";

const STATUS_CODE_400 = 400;
const STATUS_CODE_404 = 404;
const STATUS_CODE_401 = 401;

const responseError = (res, error, logging = false) => {
  if (logging) console.log(error);

  let messageAlternative = "Something when wrong!";
  let status = error.status ? error.status : 400;
  let message = error.message ? error.message : messageAlternative;
  return res.status(status).json({ message });
};

const setResponseError = (status = 400) => {
  switch (status) {
    case 400:
      return { message: MESSAGE_400, status };
    case 401:
      return { message: MESSAGE_401, status };
    case 404:
      return { message: MESSAGE_404, status };
    default:
      return { message: MESSAGE_ALT, status };
  }
};

module.exports = {
  responseError,
  setResponseError,
  STATUS_CODE_400,
  STATUS_CODE_401,
  STATUS_CODE_404,
};
