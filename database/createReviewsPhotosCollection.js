const mongoose = require('mongoose');
const { db } = require('./index.js');

const reviewsPhotosSchema = new mongoose.Schema({
  "product_id": { type: Number, unique: true },
  "photos": [
    {
      "id": { type: Number, unique: true },
      "url": String
    }
  ]
});

// create indexes
reviewsPhotosSchema.index({product_id: 1, photos_id: 1});
// compile schema into a Model (a class with which we construct documents)
const ReviewsPhotos = mongoose.model('ReviewsPhotos', reviewsPhotosSchema, 'reviews_photos');

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
      { $addFields: { product_id: '$_id' } },
      { $merge: 'reviews_photos_collection' }
    ]
  );
  console.log('reviews_photos_collection CREATED');
}

createCollection();