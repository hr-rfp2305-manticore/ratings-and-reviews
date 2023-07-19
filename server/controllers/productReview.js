const model = require('../models/productReview.js');

exports.getReviews = async (req, res) => {
  let reviews = null;
  const queryParams = Object.keys(req.query);
  const product_id = Number(req.query.product_id);
  const sort_by_field = req.query.sort || 'relevant';
  const page = Number(req.query.page) || 1;
  const count = Number(req.query.count) || 5;
  try {
    reviews = await model.getProductReviews(product_id, sort_by_field, page, count);
    res.status(200).send(reviews);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  };
};

exports.getReviewMeta = async (req, res) => {
  const product_id = Number(req.query.product_id);
  try {
    const reviewMetadata = await model.getReviewMetadata(product_id);
    res.status(200).send(reviewMetadata[0]);
  } catch {
    console.log(error);
    res.status(400).send(error);
  };
};

exports.postReview = async (req, res) => {
  try {
    console.time('add a product review to db')
    await model.addProductReview(req.body);
    console.timeEnd('add a product review to db')
    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  };
};

exports.putReviewHelpful = async (req, res) => {
  const review_id = Number(req.params.review_id);
  try {
    await model.markReviewHelpful(review_id);
    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  };
};

exports.putReviewReported = async (req, res) => {
  const review_id = Number(req.params.review_id);
  try {
    await model.markReviewReported(review_id);
    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  };
};
