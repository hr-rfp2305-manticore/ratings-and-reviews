const csv = require('csv-parser');
const fs = require('fs');
// const { Transform } = require('node:stream');
const Transform = require('stream').Transform;
// import { transform } from 'stream-transform/sync';
// const transform = require('stream-transform');
const results = {};

// fs.createReadStream('../../data/reviews_photos.csv')
//   .pipe(csv())
//   .on('data', (data) => results.push(data))
//   .on('end', () => {
//     console.log(results.slice(0,10));
//   });

// const transformer = new Transform({
//   objectMode: true, //
//   transform(chunk, encoding, next) {
//     console.log(chunk.class);
//     return chunk.class;
//   }
// })

var reviews_photos = {};
var number2 = 0;
const stream2 = fs.createReadStream('../../data/reviews_photos.csv')
  .pipe(csv())
  // .pipe(transformer)
  .on('data', (data) => {
    var review_id = data.review_id;
    delete data.review_id;  // remove review_id from the data obj
    if (reviews_photos[review_id] === undefined) {
      reviews_photos[review_id] = [data]; // tonumber?
    } else {
      reviews_photos[review_id].push(data);
    }
    number2++;
    if (number2 === 10) {
      stream2.pause();
      // console.log(reviews_photos);
    }
  });

var number = 0;
const stream1 = fs.createReadStream('../../data/reviews.csv')
  .pipe(csv())
  // .pipe(transformer)
  .on('data', (data) => {
    var product_id = data.product_id
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
      photos: reviews_photos[data.id] ? reviews_photos[data.id] : []
    }
    if (results[product_id] === undefined) {
      results[product_id] = [review]; // tonumber?
    } else {
      results[product_id].push(review);
    }
    number++;
    // console.log(data)
    // results.push(data);
    if (number === 6) {
      stream1.pause();
      console.log(results);
    }
  })
  .on('end', () => {
    console.log(results);
  });


var reviews_photos = {};
var number2 = 0;
const stream2 = fs.createReadStream('../../data/reviews_photos.csv')
  .pipe(csv())
  // .pipe(transformer)
  .on('data', (data) => {
    var review_id = data.review_id;
    delete data.review_id;  // remove review_id from the data obj
    if (reviews_photos[review_id] === undefined) {
      reviews_photos[review_id] = [data]; // tonumber?
    } else {
      reviews_photos[review_id].push(data);
    }
    number2++;
    if (number2 === 10) {
      stream2.pause();
      // console.log(reviews_photos);
    }
  });