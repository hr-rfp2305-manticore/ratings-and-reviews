const { MongoClient } = require('mongodb');
require('dotenv').config();

const createReviewsMetadata = async () => {
  const client = await MongoClient.connect(`mongodb://${process.env.DB_HOST}:27017`, {
    useUnifiedTopology: true,
  });

  const db = client.db('hr-sdc-manticore');

  const reviews = db.collection('reviews');
  // await reviews.createIndex({ id: 1 });

  // start timer
  console.time('create reviews_metadata');

  const cursor = reviews.aggregate([
    {
      $group:
        {
          _id: "$product_id",
          rating_0: {
            $sum: {
              $cond: [
                {
                  $eq: ["$rating", 0],
                },
                1,
                0,
              ],
            },
          },
          rating_1: {
            $sum: {
              $cond: [
                {
                  $eq: ["$rating", 1],
                },
                1,
                0,
              ],
            },
          },
          rating_2: {
            $sum: {
              $cond: [
                {
                  $eq: ["$rating", 2],
                },
                1,
                0,
              ],
            },
          },
          rating_3: {
            $sum: {
              $cond: [
                {
                  $eq: ["$rating", 3],
                },
                1,
                0,
              ],
            },
          },
          rating_4: {
            $sum: {
              $cond: [
                {
                  $eq: ["$rating", 4],
                },
                1,
                0,
              ],
            },
          },
          rating_5: {
            $sum: {
              $cond: [
                {
                  $eq: ["$rating", 5],
                },
                1,
                0,
              ],
            },
          },
          recommend_true: {
            $sum: {
              $cond: [
                {
                  $eq: ["$recommend", "true"],
                },
                1,
                0,
              ],
            },
          },
          recommend_false: {
            $sum: {
              $cond: [
                {
                  $eq: ["$recommend", "false"],
                },
                1,
                0,
              ],
            },
          },
        },
    },
    {
      $project:
        {
          product_id: "$_id",
          ratings: {
            0: "$rating_0",
            1: "$rating_1",
            2: "$rating_2",
            3: "$rating_3",
            4: "$rating_4",
            5: "$rating_5",
          },
          recommended: {
            1: "$recommend_true",
            0: "$recommend_false",
          },
        },
    },
    {
      $lookup:
        {
          from: "characteristics_collection",
          localField: "product_id",
          foreignField: "_id",
          as: "result",
        },
    },
    {
      $addFields:
        {
          temp: {
            $arrayElemAt: ["$result", 0],
          },
          result: "$$REMOVE",
        },
    },
    {
      $addFields:
        {
          characteristics: "$temp.characteristics",
          temp: "$$REMOVE",
        },
    },
    {
      $merge: 'reviews_metadata'
    }
  ]);

  await cursor.toArray();
  // end timer and print the duration
  console.timeEnd('create reviews_metadata');

  // close db connection
  client.close();
};

module.exports = createReviewsMetadata;