const { MongoClient } = require('mongodb');

const createCharacteristicReviewsCollection = async () => {
  const client = await MongoClient.connect('mongodb://localhost:27017', {
    useUnifiedTopology: true,
  });

  const db = client.db('hr-sdc-manticore');

  // define collections
  const characteristicReviews = db.collection('characteristic_reviews');

  // create indexes
  await characteristicReviews.createIndex({ id: 1 });

  // start timer
  console.time('create characteristic_reviews_collection');

  const cursor = characteristicReviews.aggregate([
    {
      $group: {
        _id: '$characteristic_id',
        total: { $sum: '$value' },
        count: { $sum: 1 }
      }
    },
    {
      $merge: 'characteristic_reviews_collection'
    }
  ]);

  await cursor.toArray();
  // end timer and print the duration
  console.timeEnd('create characteristic_reviews_collection');

  // close db connection
  client.close();
};

module.exports = createCharacteristicReviewsCollection;