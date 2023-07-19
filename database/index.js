const createReviewsPhotosCollection = require('./ETL/createReviewsPhotosCollection.js');
const createProductReviews = require('./ETL/createProductReviews.js');
const createCharacteristicReviewsCollection = require('./ETL/createCharacteristicReviewsCollection.js');
const createReviewsMetadata = require('./ETL/createReviewsMetadata.js');
const createCharacteristicCollection = require('./ETL/createCharacteristicCollection.js');

const aggregateData = async () => {
  try {
    console.log('Start ETL')
    await createReviewsPhotosCollection();
    await createProductReviews();
    await createCharacteristicReviewsCollection();
    await createCharacteristicCollection();
    await createReviewsMetadata()
    console.log('End ETL')
  } catch (error) {
    console.log(error);
  }
};

aggregateData();

