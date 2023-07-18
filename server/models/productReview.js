const { MongoClient } = require('mongodb');
let db;

const connectDb = async () => {
  // if connected, returun
  if (db) {
    return db;
  }
  const client = await MongoClient.connect('mongodb://localhost:27017', {
    useUnifiedTopology: true,
  });
  console.log('connected to mongodb!')
  return db = client.db('hr-sdc-manticore');
};

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
    }
    return ;
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
  // add to mongoDB collection `product_reviews`
  // TODO: takes too long to get the latest reviewId
  // TODO: add to (update) characteristics collection
  try {
    const db = await connectDb();
    const reviewId = await db.collection('product_reviews').aggregate(
      [
        { $unwind: { path: '$results' } },
        { $count: 'product_id' }
      ]
    ).toArray();
    console.log('review_id: ',reviewId );
    const {product_id, name, ...review} = data;

    return db.collection('product_reviews').updateOne(
      { product_id: product_id },
      { $push: { results: { review_id: reviewId[0].product_id + 1, reviewer_name: name, ...review } } }
    );
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
      { $set: {reported: "true" } }
      );

    // delete from product_reviews collection (the data in this collection has been filtered by `reported`)
    return db.collection('product_reviews')
      .updateOne(
        { },
        { $pull: { 'results': { 'review_id': review_id } } }  //TODO: Fix bug, this is not working
      );
  } catch (error) {
    console.log(error);
  };
};