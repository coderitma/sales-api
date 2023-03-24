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

module.exports = { getCleanQueryParams };
