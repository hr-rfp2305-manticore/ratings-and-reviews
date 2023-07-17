// UNUSED FILE:
// - reading csv files and transforming data: memory heap out of memory -> increase node.js heap memory to 8GB
// - iterating through the data object and save into mongodb as documents: memory heap out of memory
//   -> save entire data object as a document into mongodb: exceed limit for single document in mongodb
// => REDO ETL
const csv = require('csv-parser');
const fs = require('fs');
const db = require('./index.js');

const reviewsPhotos = {};
/*
{
  reviewId: [
    {
      id: photoId,
      url: photoUrl
    },
    ...
  ],
  ...
}
*/
const reviews = {};
/*
{
  productId: [
    {
      review_id: data.id,
      rating: data.rating,
      summary: data.summary,
      recommend: data.recommend,
      response: data.response,
      body: data.body,
      date: data.date,
      reviewer_name: data.reviewer_name,
      helpfulness: data.helpfulness,
      photos: reviews_photos[data.id] ? reviews_photos[data.id] : []
    },
    ...
  ],
  ...
}
*/
const reviewsMetadata = {};
/*
{
  productId: {
    ratings: {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0
    },
    recommended: {
      'false': 0,
      'true': 0
    },
    characteristics: {
      Quality: {
        id: characteristicId,
        value: { total: 0, count: 0 }
      }
    }
  }
}
*/
const characteristicValues = {}
/*
{ characteristicId: { total: 0, count: 0 } }
*/
const emptyProducts = [];

const limit = 30;
const processReadStreams = async function () {
  var count1 = 0;
  const readStream1 = () => {
    return new Promise((resolve, reject) => {
      const stream1 = fs.createReadStream('../../data/reviews_photos.csv')
        .pipe(csv())
        .on('data', (data) => {
            var reviewId = data.review_id;
            delete data.review_id;  // remove review_id from the data obj
            if (reviewsPhotos[reviewId] === undefined) {
              reviewsPhotos[reviewId] = [data]; // tonumber?
            } else {
              reviewsPhotos[reviewId].push(data);
            }
            count1++;
            if (limit && count1 === limit) {
              stream1.pause();
              resolve();
              // console.log('reviews_photos.csv DONE')
            }
        })
        .on('end', () => {
          resolve();
          // console.log('reviews_photos.csv DONE')
        })
    })
  };

  var count2 = 0;
  const readStream2 = () => {
    return new Promise((resolve, reject) => {
      const stream2 = fs.createReadStream('../../data/reviews.csv')
      .pipe(csv())
      .on('data', (data) => {
        var productId = data.product_id
        // review
        var review = {
          review_id: data.id,
          rating: data.rating,
          summary: data.summary,
          recommend: data.recommend,
          response: data.response,
          body: data.body,
          date: data.date,
          reviewer_name: data.reviewer_name,
          helpfulness: data.helpfulness,
          photos: reviewsPhotos[data.id] ? reviewsPhotos[data.id] : []
        }
        if (reviews[productId] === undefined) {
          reviews[productId] = [review]; // tonumber?
        } else {
          reviews[productId].push(review);
        }
        //review meta
        if (reviewsMetadata[productId] === undefined) {
          reviewsMetadata[productId] = {
            ratings: {
              '1': 0,
              '2': 0,
              '3': 0,
              '4': 0,
              '5': 0
            },
            recommended: {
              'false': 0,
              'true': 0
            },
            characteristics: {}
          }
        }
        reviewsMetadata[productId].ratings[data.rating] += 1;
        reviewsMetadata[productId].recommended[data.recommend] += 1;
        count2++;
        if (limit && count2 === limit) {
          stream2.pause();
          resolve();
          // console.log('reviews.csv DONE');
        }
      })
      .on('end', () => {
        resolve();
        // console.log('reviews.csv DONE')
      })
    })
  }

  var count3 = 0;
  const readStream3 = () => {
    return new Promise ((resolve, refect) => {
      const stream3 = fs.createReadStream('../../data/characteristic_reviews.csv')
        .pipe(csv())
        .on('data', (data) => {
          var characteristicId = data.characteristic_id;
          var characteristicValue = data.value;
          if (characteristicValues[characteristicId] === undefined) {
            characteristicValues[characteristicId] = {
              total: 0,
              count: 0
            };
          }
          characteristicValues[characteristicId].total += Number(characteristicValue);
          characteristicValues[characteristicId].count++;
          count3++;
          if (limit && count3 === limit) {
            stream3.pause();
            resolve();
            // console.log('characteristic_reviews.csv DONE');
          }
        })
        .on('end', () => {
          resolve();
          // console.log('characteristic_reviews.csv DONE');
        })
    })
  }

  var count4 = 0;
  const readStream4 = () => {
    return new Promise((resolve, reject) => {
      const stream4 = fs.createReadStream('../../data/characteristics.csv')
      .pipe(csv())
      .on('data', (data) => {
        var productId = data.product_id;
        var characteristic_name = data.name;
        var characteristic_id = data.id;
        if (reviewsMetadata[productId] === undefined) {
          reviewsMetadata[productId] = {
            ratings: {
              '1': 0,
              '2': 0,
              '3': 0,
              '4': 0,
              '5': 0
            },
            recommended: {
              'false': 0,
              'true': 0
            },
            characteristics: {}
          }
          emptyProducts.push(productId); // just in case
        }
        reviewsMetadata[productId].characteristics[characteristic_name] = {
          id: characteristic_id,
          value: characteristicValues[characteristic_id] || {total: 0, count: 0}
        };

        count4++;
        if (limit && count4 === limit) {
          stream4.pause();
          resolve();
          console.log(characteristicValues);
          // console.log('characteristics.csv DONE');
        }
      })
      .on('end', () => {
        resolve();
        // console.log('characteristics.csv DONE');
      })
    })
  }

  console.log('START');
  console.log('=========================================================');
  var head = Date.now();
  var start = Date.now();
  await readStream1();
  var end = Date.now();
  console.log(`reviews_photos.csv execution time: ${end - start} ms`)
  console.log('---------------------------------------------------------');

  start = Date.now();
  await readStream2();
  end = Date.now();
  console.log(`reviews.csv execution time: ${end - start} ms`)
  console.log('---------------------------------------------------------');

  start = Date.now();
  await readStream3();
  end = Date.now();
  console.log(`characteristic_reviews.csv execution time: ${end - start} ms`)
  console.log('---------------------------------------------------------');

  start = Date.now();
  await readStream4();
  end = Date.now();
  var tail = Date.now();
  console.log(`characteristics.csv execution time: ${end - start} ms`)
  console.log('---------------------------------------------------------');

  console.log('reviews:', reviews['14'][4].photos)
  // console.log('reviewsMetadata:', reviewsMetadata)
  console.log('reviewsMetadata:', reviewsMetadata['10'].characteristics)
  console.log(`TOTAL EXECUTION TIME: ${tail - head} ms`)
  // console.log('\nproducts with characteristic data without review data: ', emptyProducts);


  // start = Date.now();
  // db.collection('productReviews').insertOne(reviews, (error, result) => {
  //   if (error) {
  //     console.error('Error inserting document:', error);
  //   } else {
  //     console.log('Document inserted successfully');
  //   }
  // });

  // db.collection('reviewsMetadata').insertOne(reviewsMetadata, (error, result) => {
  //   if (error) {
  //     console.error('Error inserting document:', error);
  //   } else {
  //     console.log('Document inserted successfully');
  //   }

  //   db.close()
  // });
  // end = Date.now();
  // console.log(`save data to DB execution time ${end - start} ms`)

  // const saveDataToDB = () => {
  //   return new Promise((resolve, reject) => {
  //     Object.entries(reviews).forEach(([key, value]) => {
  //       // console.log(productReview)
  //       try {
  //         const productReviews = new Review({
  //         product: key,
  //         results: value
  //         });

  //         productReviews.save();
  //         // console.log(productReviews);
  //       } catch (error) {
  //         console.log(error)
  //       }
  //     });
  //     resolve();
  //   });
  // };

  // start = Date.now();
  // saveDataToDB()
  //   .then(() => {
  //     Object.entries(reviewsMetadata).forEach(([key, value]) => {
  //       // console.log(productReview)
  //       try {
  //         const productReviewMetadata = new ReviewMetadata({
  //           product_id: key,
  //           ...value
  //         });
  //         productReviewMetadata.save();
  //         // console.log(productReviewMetadata);
  //       } catch (error) {
  //         console.log(error);
  //       }
  //     });
  //   })
  //   .then(() => {
  //     // close db connection
  //     // db.close();
  //     // console.log('mongoDB connection closed');
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   })
};

processReadStreams();
