const { MongoClient } = require('mongodb');
require('dotenv').config();

const createReviewsPhotosCollection = async () => {
  const client = await MongoClient.connect(`mongodb://${process.env.DB_HOST}:27017`, {
    useUnifiedTopology: true,
  });

  const db = client.db('hr-sdc-manticore');

  // define collections
  const reviewsPhotos = db.collection('reviews_photos');

  // create indexes
  await reviewsPhotos.createIndex({ id: 1 });

  // start timer
  console.time('create reviews_photos_collection');

  const cursor = reviewsPhotos.aggregate([
    {
      $group: {
        _id: '$review_id',
        photos: {
          $push: { id: '$id', url: '$url' }
        }
      }
    },
    {
      $addFields: { review_id: '$_id' }
    },
    {
      $merge: 'reviews_photos_collection'
    }
  ]);

  await cursor.toArray();
  // end timer and print the duration
  console.timeEnd('create reviews_photos_collection');

  // close db connection
  client.close();
};

module.exports = createReviewsPhotosCollection;
