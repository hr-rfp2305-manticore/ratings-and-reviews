const createReviewsPhotosCollection = require('./createReviewsPhotosCollection.js');
const createProductReviews = require('./createProductReviews.js');
const createCharacteristicReviewsCollection = require('./createCharacteristicReviewsCollection.js');
const createReviewsMetadata = require('./createReviewsMetadata.js');

const aggregateData = async () => {
  try {
    await createReviewsPhotosCollection();
    await createProductReviews();
    await createCharacteristicReviewsCollection();
    await createReviewsMetadata()
  } catch (error) {
    console.log(error);
  }
};

aggregateData();

