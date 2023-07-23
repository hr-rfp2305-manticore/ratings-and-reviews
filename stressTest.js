import http from 'k6/http';
import { sleep } from  'k6';

export let options = {
  insecureSkipTLSVerify: true,
  noConnectionReuse: false,
  stages: [
    { duration: '1m', target: 50},
    { duration: '2m', target: 500},
    { duration: '5m', target: 1000},
    { duration: '2m', target: 200},
    { duration: '1m', target: 0},
    // { duration: '1000ms', target: 1},
    // { duration: '2000ms', target: 5},
    // { duration: '5000ms', target: 10},
    // { duration: '2000ms', target: 2},
    // { duration: '1000ms', target: 0},
  ]
};

export default () => {
  const product_id = Math.floor(Math.random() * 10000);
  const url = `http://${process.env.DB_HOST}/reviews?product_id=${product_id}`

  http.get(url);
}