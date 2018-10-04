const whiteList = [
  /.*localhost.*/,
  /.*wko[.].*/,
  /.*beer[.].*/
];

module.exports = function acceptedSites(req, callback)
{

  let corsOptions = null;
  const origin = req.header('Origin');

  try {

    if (whiteList.find(x => x.test(origin))) {
      corsOptions = { origin: true }
    }
    else {
      corsOptions = { origin: false }
    }

    return callback(null, corsOptions)

  }
  catch (err) {
    return callback(err, corsOptions);
  }

};


