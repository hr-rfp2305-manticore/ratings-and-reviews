const { MongoClient } = require('mongodb');
require('dotenv').config();
let db;
let review_id;

const connectDb = async () => {
  // if connected, returun
  if (db) {
    return db;
  }
  const client = await MongoClient.connect(`mongodb://${process.env.DB_HOST}:27017`, {
    useUnifiedTopology: true,
  });
  console.log('connected to mongodb!')
  db = client.db('hr-sdc-manticore');
  return db
};

let reviewIdPromise = null;
const getReviewId = async () => {
  // if review
  console.log('reviewIdPromise: ', reviewIdPromise)
  if (!reviewIdPromise) {
    const db = await connectDb();
    console.time('get latest review_id');
    reviewIdPromise = (async () => {
      const id = await db.collection('product_reviews').aggregate(
        [
          { $unwind: { path: '$results' } },
          { $group:{ _id: null, count:{ $sum:1 } } }
        ]
      ).toArray();
      console.timeEnd('get latest review_id');
      review_id = id[0].count;
      console.log('review id: ', review_id)
      return review_id;
    })();
  }
  return reviewIdPromise;
};

// get current count of reviews in the db when the server loads,
// so I know what the newest review_id should be when adding a review
getReviewId();

exports.getProductReviews = async (product_id, sort_by_field, page, count) => {
  try {
    const db = await connectDb();
    const document = await db.collection('product_reviews').findOne({ product_id: product_id });
    if (document) {
      let results;
      if (sort_by_field === 'helpful') {
        results = document.results.sort((a, b) => b.helpfulness - a.helpfulness).slice(0, page * count);
      } else if (sort_by_field === 'newest') {
        results =  document.results.sort((a, b) => b.date - a.date).slice(0, page * count);
      } else if (sort_by_field === 'relevant') {
        /*
        Relevance will be determined by a combination of both the date that the review was submitted as well as ‘helpfulness’ feedback received. This combination should weigh the two characteristics such that recent reviews appear near the top, but do not outweigh reviews that have been found helpful. Similarly, reviews that have been helpful should appear near the top, but should yield to more recent reviews if they are older.
        */
       // return  document.results.sort((a, b) => b.review_id - a.review_id).slice(0, number);
      }
      return ({
        product: product_id,
        page: page,
        count: count,
        results: results
      });
    } else {
      console.log('product does not exist: ', product_id);
      return;
    }
  } catch (error) {
    console.log(error);
  };
};

exports.getReviewMetadata = async (product_id) => {
  try {
    const db = await connectDb();
    return db.collection('reviews_metadata').aggregate([
      {
        $match: {
          product_id: product_id
        }
      },
      {
        $addFields: {
          characteristicsArray: {
            $objectToArray: '$characteristics'
          }
        }
      },
      {
        $addFields: {
          characteristicsArray: {
            $map: {
              input: '$characteristicsArray',
              as: 'char',
              in: {
                k: '$$char.k',
                v: {
                  id: '$$char.v.id',
                  value: {
                    $divide: [
                      '$$char.v.total',
                      '$$char.v.count'
                    ]
                  }
                }
              }
            }
          },
          characteristics: '$$REMOVE'
        }
      },
      {
        $addFields: {
          characteristics: {
            $arrayToObject: '$characteristicsArray'
          },
          characteristicsArray: '$$REMOVE'
        }
      }
    ])
    .toArray();
  } catch (error) {
    console.log(error);
  };
};

exports.addProductReview = async (data) => {
  // TODO: takes too long to get the latest review_id
  try {
    const db = await connectDb();
    const latest_review_id = review_id || await getReviewId();
    review_id = latest_review_id + 1;
    // console.log('latest review id: ', review_id)

    const {product_id, characteristics, name, ...review} = data;

    // add to (update) reviews_metadata
    const review_metadata = await db.collection('reviews_metadata').findOne({ '_id': product_id });
    review_metadata.ratings[data.rating]++;
    review_metadata.recommended[data.recommend? 1: 0]++;
    for (char in characteristics) {
      review_metadata.characteristics[char].count++;
      review_metadata.characteristics[char].total += characteristics[char];
    }
    await db.collection('reviews_metadata').replaceOne(
      { _id: product_id },
      review_metadata
    );

    // add a new product review to product_reviews
    await db.collection('product_reviews').updateOne(
      { product_id: product_id },
      { $push: { results: {
        review_id: review_id,
        reviewer_name: name,
        response: null,
        date: new Date(),
        helpfulness: 0,
        ...review
      } } }
    );
    return;
  } catch (error) {
    console.log(error);
  }
};

exports.markReviewHelpful = async (review_id) => {
  try {
    const db = await connectDb();
    return db.collection('product_reviews').updateOne(
      { results: { $elemMatch: {review_id: review_id } } },
      { $inc: {'results.$.helpfulness': 1} }
    );
  } catch (error) {
    console.log(error);
  }
};

exports.markReviewReported = async (review_id) => {
  try {
    const db = await connectDb();
    // change original data in reviews collection (this collection contains all data)
    db.collection('reviews').updateOne(
      { id: review_id },
      { $set: { reported: "true" } }
    );

    // delete from product_reviews collection (the data in this collection has been filtered by `reported`)
    return db.collection('product_reviews')
      .updateOne(
        { results: { $elemMatch: {review_id: review_id } } }, // find the document that consists the review_id
        { $pull: { 'results': { 'review_id': review_id } } }
      );
  } catch (error) {
    console.log(error);
  };
};