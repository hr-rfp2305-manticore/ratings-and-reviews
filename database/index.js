const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/ratings-and-reviews');  // db name: ratings-and-reviews

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log('mongoDB connected!')
});

// product review schema
const reviewSchema = new mongoose.Schema({
    "product": { type: Number, unique: true },
    "results": [
      {
        "review_id": Number,
        "rating": Number,
        "summary": String,
        "recommend": Boolean,
        "response": Number,
        "body": String,
        "date": { type: Date, default: Date.now },
        "reviewer_name": String,
        "helpfulness": Number,
        "photos": [{
            "id": Number,
            "url": String
          }
        ]
      },
    ]
});

// compile schema into a Model (a class with which we construct documents)
const Review = mongoose.model('Review', reviewSchema);

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
    0: Number,
    1: Number
  },
  "characteristics": {
    "Size": {
      "id": Number,
      "value": mongoose.Decimal128
    },
    "Width": {
      "id": Number,
      "value": mongoose.Decimal128
    },
    "Comfort": {
      "id": Number,
      "value": mongoose.Decimal128
    },
    "Quality": {
			"id": Number,
			"value": mongoose.Decimal128
		}
  }
});

const ReviewMetadata = mongoose.model('ReviewMetadata', reviewMetadataSchema);

const reviewMetadata = new ReviewMetadata({
  "product_id": "2",
  "ratings": {
    2: 1,
    3: 1,
    4: 2,
  },
  "recommended": {
    0: 5,
    1: 2
  },
  "characteristics": {
    "Size": {
      "id": 14,
      "value": "4.0000"
    },
    "Width": {
      "id": 15,
      "value": "3.5000"
    },
    "Comfort": {
      "id": 16,
      "value": "4.0000"
    }
  }
});
console.log(reviewMetadata);

const review = new Review({
  "product": "2",
  "results": [
    {
      "review_id": 5,
      "rating": 3,
      "summary": "I'm enjoying wearing these shades",
      "recommend": false,
      "response": null,
      "body": "Comfortable and practical.",
      "date": "2019-04-14T00:00:00.000Z",
      "reviewer_name": "shortandsweeet",
      "helpfulness": 5,
      "photos": [{
          "id": 1,
          "url": "urlplaceholder/review_5_photo_number_1.jpg"
        },
        {
          "id": 2,
          "url": "urlplaceholder/review_5_photo_number_2.jpg"
        },
      ]
    },
    {
      "review_id": 3,
      "rating": 4,
      "summary": "I am liking these glasses",
      "recommend": false,
      "response": "Glad you're enjoying the product!",
      "body": "They are very dark. But that's good because I'm in very sunny spots",
      "date": "2019-06-23T00:00:00.000Z",
      "reviewer_name": "bigbrotherbenjamin",
      "helpfulness": 5,
      "photos": [],
    }
  ]
});

console.log(review);

