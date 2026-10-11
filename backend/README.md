# Backend

## Configure MongoDB

Copy `.env.example` to `.env` and set `MONGO_URI` to your MongoDB connection
string. The example URI connects to a local MongoDB server on port 27017; start
MongoDB before starting the backend, or use a MongoDB Atlas connection string.

Install dependencies and run the API from this directory:

```sh
npm install
npm run dev
```

The server waits for MongoDB to connect before listening on `PORT` (5000 by
default). Check `GET /health` to verify that the API is running and the
database connection is available. The endpoint returns HTTP 503 if the database
is disconnected.
``` for start the manogoo```
```sudo systemctl start mongod``
```sudo systemctl status mongod```
