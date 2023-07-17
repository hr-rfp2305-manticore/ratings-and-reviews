const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/sdc-manticore');  // db name: sdc-manticore

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log('mongoDB connected!')
});

// product review schema
const reviewSchema = new mongoose.Schema({
  "product_id": { type: Number, unique: true },
  "results": [
    {
      "review_id": Number,
      "rating": Number,
      "summary": String,
      "recommend": Boolean,
      "response": String,
      "body": String,
      "date": { type: Date, default: Date.now },
      "reviewer_name": String,
      "helpfulness": { type:Number, default: 0 },
      "photos": [
        {
          "id": Number,
          "url": String
        }
      ]
    },
  ]
});

// product review metadata schema
const reviewMetadataSchema = new mongoose.Schema({
  "product_id": { type: Number, unique: true },
  "ratings": {
		1: Number,
    2: Number,
    3: Number,
    4: Number,
    5: Number
  },
  "recommended": {
    1: Number,
    0: Number
  },
  "characteristics": {
    "Size": {
      "id": Number,
      "value": Number
    },
    "Width": {
      "id": Number,
      "value": Number
    },
    "Comfort": {
      "id": Number,
      "value": Number
    },
    "Quality": {
			"id": Number,
			"value": Number
		},
    "Fit": {
			"id": Number,
			"value": Number
    },
    "Length": {
			"id": Number,
			"value": Number
		}
  }
});




module.exports = {
  db: db,
  // compile schema into a Model (a class with which we construct documents)
  Review:  mongoose.model('Review', reviewSchema, 'product_reviews'), // specify collection: 'product_reviews'
  ReviewMetadata: mongoose.model('ReviewMetadata', reviewMetadataSchema,'reviews_meta'),
};