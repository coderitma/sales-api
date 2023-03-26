const getCleanQueryParams = ({ query }) => {
  let q = [];
  Object.keys(query).map((key) => {
    if (query[key]) {
      q.push({ [key]: query[key] });
    }
  });

  if (q.length > 0) {
    return { $or: q };
  }

  return {};
};

const responseErrorBuilder = (error) => {
  let listOfStatus = [400, 401, 402, 403, 404, 405, 500, 501];
  let status = 400;
  let message = "Something when wrong!";

  if (listOfStatus.includes(error.status)) {
    status = error.status;
  }

  if (error.message) {
    message = error.message;
  }

  return { status, message };
};

module.exports = { getCleanQueryParams, responseErrorBuilder };
