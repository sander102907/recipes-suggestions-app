const HttpStatusCodes = require('http-status-codes').StatusCodes;
var request = require('request');

function getAccessToken() {
    return new Promise((resolve, reject) => {
        request.post('https://ms.ah.nl/create-anonymous-member-token', function(err, resp, body) {
            if (err || resp.statusCode !== HttpStatusCodes.OK) {
                console.log('error getting ah access token', err.statusCode, err.ErrorMessage);
                reject();
            }
            resolve(JSON.parse(body).access_token);
        });
    });
}

const searchProducts = async (req, res) => {
    const query = req.query.query;

    const access_token = await getAccessToken();
    request.get({url:'https://ms.ah.nl/mobile-services/product/search/v2?sortOn=RELEVANCE', qs:{"query": query, "size": 6}}, function(err, resp, body) {
        if (err || resp.statusCode !== HttpStatusCodes.OK) {
            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
          }
          res.send(JSON.parse(body).products);
    })
    .auth(null, null, true, access_token);
}

const getBonusProducts = (req, res) => {
    
    request.get('https://www.ah.nl/bonus/api/segments?segmentType=-PREMIUM', function(err, resp, body) {
        if (err || resp.statusCode !== HttpStatusCodes.OK) {
            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
          } else {
              let bonus = JSON.parse(body).collection;
              let bonusProducts = bonus.filter(function (item) {
                  return item.promotionType !== "INCENTIVE";
              })
              res.send(bonusProducts);

          }
    })
}

module.exports = {
    searchProducts,
    getBonusProducts
}