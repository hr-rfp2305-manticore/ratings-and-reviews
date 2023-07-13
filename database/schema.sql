CREATE TABLE products (
  product_id INT PRIMARY KEY,
  rating1 INTEGER,
  rating2 INTEGER,
  rating3 INTEGER,
  rating4 INTEGER,
  rating5 INTEGER,
  recommended_yes INTEGER,
  recommended_no INTEGER,
  size_id INTEGER,
  size_value INTEGER,
  width_id INTEGER,
  width_value INTEGER,
  comfort_id INTEGER,
  comfort_value INTEGER,
  quality_id INTEGER,
  quality_value INTEGER
);


CREATE TABLE reviews (
  review_id INTEGER PRIMARY KEY,
  product_id INTEGER,
  rating INTEGER,
  summary TEXT,
  recommend BOOLEAN,
  response TEXT,
  body TEXT,
  review_date DATE,
  reviewer_name TEXT,
  helpfulness INTEGER,
  FOREIGN KEY(product_id) REFERENCES products (product_id)
);


CREATE TABLE photos (
  photo_id INTEGER PRIMARY KEY,
  review_id INTEGER,
  photo_url TEXT,
  FOREIGN KEY(review_id) REFERENCES reviews (review_id)
);