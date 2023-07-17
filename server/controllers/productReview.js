const models = require('../models/productReview.js');

exports.getReviews = async (req, res) => {
  console.log('query: ', req.query)
  let reviews = null;
  const queryParams = Object.keys(req.query);
  const sort_by_field = req.query.sort || 'relevant';
  const page = req.query.page || 1;
  const count = req.query.count || 5;
  const number = page * count;
  try {
    if (queryParams.length === 1 && queryParams.includes('product_id')) {
      reviews = await models.getProductReviews(req.query.product_id);
    } else {
      reviews = await models.getSortedReviews(sort_by_field, number);
    };
    res.status(200).send(reviews);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};


