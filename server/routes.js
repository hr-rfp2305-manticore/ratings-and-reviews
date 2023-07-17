var controller = require('./controllers/productReview.js');
var router = require('express').Router();

router.get('/', controller.getReviews);

module.exports = router;