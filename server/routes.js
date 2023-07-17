var controller = require('./controllers/productReview.js');
var router = require('express').Router();

router.get('/', controller.getReviews);

router.get('/meta', controller.getReviewMeta);

router.post('/', controller.postReview);

router.put('/:review_id/helpful', controller.putReviewHelpful);

router.put('/:review_id/report', controller.putReviewReported);

module.exports = router;