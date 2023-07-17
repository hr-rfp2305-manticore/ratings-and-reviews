var controller = require('./controllers/productReview.js');
var router = require('express').Router();

router.get('/', controller.getReviews);

router.get('/meta', controller.getReviewMeta);

module.exports = router;