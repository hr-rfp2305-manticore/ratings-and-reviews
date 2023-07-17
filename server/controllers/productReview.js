const model = require('../models/productReview.js');

exports.getReviews = async (req, res) => {
  let reviews = null;
  const queryParams = Object.keys(req.query);
  const sort_by_field = req.query.sort || 'relevant';
  const page = req.query.page || 1;
  const count = req.query.count || 5;
  const number = page * count;
  try {
    if (queryParams.length === 1 && queryParams.includes('product_id')) {
      reviews = await model.getProductReviews(req.query.product_id);
    } else {
      reviews = await model.getSortedReviews('newest', number);
    };
    res.status(200).send(reviews);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

exports.getReviewMeta = async (req, res) => {
  try {
    const reviewMetadata = await model.getReviewMetadata(req.query.product_id);
    res.status(200).send(reviewMetadata);
  } catch {
    console.log(error);
    res.status(400).send(error);
  };
};

exports.postReview = async (req, res) => {
  try {
    await model.addProductReview(req.body);
    // TODO: add to characteristic
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  };
};

exports.putReviewHelpful = async (req, res) => {
  const review_id = req.params.review_id;
  try {
    await model.markReviewHelpful(review_id);
    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  };
};

exports.putReviewReported = async (req, res) => {
  const review_id = req.params.review_id;
  try {
    await model.markReviewReported(review_id);
    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  };
}
