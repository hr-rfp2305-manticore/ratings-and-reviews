const { MongoClient } = require('mongodb');

const createCharacteristicCollection = async () => {
  const client = await MongoClient.connect('mongodb://localhost:27017', {
    useUnifiedTopology: true,
  });

  const db = client.db('hr-sdc-manticore');

  // define collections
  const characteristics = db.collection('characteristics');

  // create indexes
  await characteristics.createIndex({ id: 1 });

  // start timer
  console.time('create characteristics_collection');

  const cursor = characteristics.aggregate([
    {
      $lookup: {
        from: 'characteristic_reviews_collection',
        localField: 'id',
        foreignField: '_id',
        as: 'result'
      }
    },
    {
      $addFields: {
        temp: { $arrayElemAt: ['$result', 0] },
        result: '$$REMOVE'
      }
    },
    {
      $addFields: {
        characteristic: {
          Comfort: {
            $cond: {
              if: { $eq: ['$name', 'Comfort'] },
              then: {
                id: '$id',
                count: '$temp.count',
                total: '$temp.total'
              },
              else: '$$REMOVE'
            }
          },
          Fit: {
            $cond: {
              if: { $eq: ['$name', 'Fit'] },
              then: {
                id: '$id',
                count: '$temp.count',
                total: '$temp.total'
              },
              else: '$$REMOVE'
            }
          },
          Length: {
            $cond: {
              if: { $eq: ['$name', 'Length'] },
              then: {
                id: '$id',
                count: '$temp.count',
                total: '$temp.total'
              },
              else: '$$REMOVE'
            }
          },
          Quality: {
            $cond: {
              if: { $eq: ['$name', 'Quality'] },
              then: {
                id: '$id',
                count: '$temp.count',
                total: '$temp.total'
              },
              else: '$$REMOVE'
            }
          },
          Size: {
            $cond: {
              if: { $eq: ['$name', 'Size'] },
              then: {
                id: '$id',
                count: '$temp.count',
                total: '$temp.total'
              },
              else: '$$REMOVE'
            }
          },
          Width: {
            $cond: {
              if: { $eq: ['$name', 'Width'] },
              then: {
                id: '$id',
                count: '$temp.count',
                total: '$temp.total'
              },
              else: '$$REMOVE'
            }
          }
        }
      }
    },
    {
      $group: {
        _id: '$product_id',
        characteristicsArray: {
          $push: '$characteristic'
        }
      }
    },
    {
      $project: {
        characteristics: {
          $mergeObjects: '$characteristicsArray'
        }
      }
    },
    {
      $merge: 'characteristics_collection'
    }
  ]);

  await cursor.toArray();
  // end timer and print the duration
  console.timeEnd('create characteristics_collection');

  // close db connection
  client.close();
};

module.exports = createCharacteristicCollection;