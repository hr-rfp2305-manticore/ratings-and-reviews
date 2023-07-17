const { db, Review, ReviewMetadata } = require('../../database/index.js');

exports.getProductReviews = (product_id) => {
    return Review.findOne({ product_id: product_id});
};

exports.getSortedReviews = (sort_by_field, number) => {
  if (sort_by_field === 'newest') {
    return Review.find({}).sort({'_id': -1}).limit(number);
  } else if (sort_by_field === 'helpful') {
    /*
    TODO:
    This sort order will prioritize reviews that have been found helpful. The order can be found by subtracting “No” responses from “Yes” responses and sorting such that the highest score appears at the top.
    */
  } else if (sort_by_field === 'relevant') {
    /*
    TODO:
    Relevance will be determined by a combination of both the date that the review was submitted as well as ‘helpfulness’ feedback received. This combination should weigh the two characteristics such that recent reviews appear near the top, but do not outweigh reviews that have been found helpful. Similarly, reviews that have been helpful should appear near the top, but should yield to more recent reviews if they are older.
    */
  }
};

exports.getReviewMetadata = (product_id) => {
  return ReviewMetadata.find({product_id: product_id})
}