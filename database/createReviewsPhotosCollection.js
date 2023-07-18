const mongoose = require('mongoose');
const { db } = require('./index.js');

// reviews_photos schema
const reviewsPhotosSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  review_id: Number,
  url: String
});

// create indexes
reviewsPhotosSchema.index({id: 1, review_id: 1});
// compile schema into a Model (a class with which we construct documents)
const ReviewsPhotos = mongoose.model('ReviewsPhotos', reviewsPhotosSchema, 'reviews_photos');

// perform aggregation on reviews_photos collection and
// create a new collection reviews_photos_collection
const createCollection = async () => {
  console.log('START')
  await ReviewsPhotos.aggregate(
    [
      {
        $group: {
          _id: '$review_id',
          photos: {
            $push: { id: '$id', url: '$url' }
          }
        }
      },
      { $addFields: { review_id: '$_id' } },
      { $merge: 'reviews_photos_collection' }
    ]
    );
    console.log('reviews_photos_collection CREATED');
  }

  createCollection();

  // reviews_photos_collection schema
  const reviewsPhotosCollectionSchema = new mongoose.Schema({
    review_id:{ type: Number, unique: true },
    photos: [
      {
        id: { type: Number, unique: true },
        url: String
      }
    ]
  });

  // create indexes
  reviewsPhotosCollectionSchema.index({review_id: 1});
  // compile schema into a Model (a class with which we construct documents)
  const ReviewsPhotosCollection = mongoose.model('ReviewsPhotosCollection', reviewsPhotosCollectionSchema, 'reviews_photos_collection');

  module.exports = ReviewsPhotosCollection;