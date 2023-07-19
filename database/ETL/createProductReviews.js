const { MongoClient } = require('mongodb');

const createProductReviews = async () => {
  const client = await MongoClient.connect('mongodb://localhost:27017', {
    useUnifiedTopology: true,
  });

  const db = client.db('hr-sdc-manticore');

  const reviews = db.collection('reviews');
  await reviews.createIndex({ id: 1, 'results.review_id': 1 });

  // start timer
  console.time('create product_reviews');

  const cursor = reviews.aggregate([
    {
      $match:
        {
          reported: "false",
        },
    },
    {
      $lookup:
        /**
         * from: The target collection.
         * localField: The local join field.
         * foreignField: The target join field.
         * as: The name for the results.
         * pipeline: Optional pipeline to run on the foreign collection.
         * let: Optional variables to use in the pipeline field stages.
         */
        {
          from: "reviews_photos_collection",
          localField: "id",
          foreignField: "_id",
          as: "new",
        },
    },
    {
      $addFields:
        {
          temp: {
            $arrayElemAt: ["$new", 0],
          },
          new: "$$REMOVE",
        },
    },
    {
      $addFields: {
        photos: {
          $ifNull: ["$temp.photos", []],
        },
      },
    },
    {
      $group:
        {
          _id: "$product_id",
          results: {
            $push: {
              review_id: "$id",
              rating: "$rating",
              summary: "$summary",
              recommend: "$recommend",
              response: "$response",
              body: "$body",
              date: "$date",
              reviewer_name: "$reviewer_name",
              helpfulness: "$helpfulness",
              photos: "$photos",
            },
          },
        },
    },
    {
      $addFields:
        {
          product_id: "$_id",
        },
    },
    {
      $merge:
        "product_reviews",
    },
  ]);

  await cursor.toArray();
  // end timer and print the duration
  console.timeEnd('create product_reviews');

  // close db connection
  client.close();
};

module.exports = createProductReviews;

