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

module.exports = {
  pageLimitOffset,
  prevNext,
};
