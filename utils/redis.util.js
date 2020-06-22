const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
// const keys = require('../configs/keys')

const client = redis.createClient(process.env.REDIS_LOCAL_CONN_URL);
client.hget = util.promisify(client.hget);

client.on("error", (error) => {
    console.error(`Error to connect Redis: ${error}`);
});

// create reference for .exec
const exec = mongoose.Query.prototype.exec;

// create new cache function on prototype
mongoose.Query.prototype.cache = function (options = { expire: 60 }) {
    this.useCache = true;
    this.expire = options.expire;
    this.hashKey = JSON.stringify(options.key || this.mongooseCollection.name);

    return this;
}

// override exec function to first check cache for data
mongoose.Query.prototype.exec = async function () {
    if (!this.useCache) {
        return await exec.apply(this, arguments);
    }

    const key = JSON.stringify({
        ...this.getQuery(),
        collection: this.mongooseCollection.name
    });

    // get cached value from redis
    const cacheValue = await client.hget(this.hashKey, key);

    if (cacheValue) {
        const doc = JSON.parse(cacheValue)  // converting back to original datatype from string

        /* While storing data in redis we may store a single object or an array of objects. 
         * We need to convert normal json into mongoose model instance before returning to app.js, 
         * this.model() is used for this purpose
        */
        console.log('Return data from MongoDB');
        return Array.isArray(doc)
            ? doc.map((d) => new this.model(d))
            : new this.model(doc);
    }

    // Data not present in redis cache, get the data from Mongodb and save the data to redis cache
    const result = await exec.apply(this, arguments)

    // just some logic to check if the data for the required query is even present in the database
    if (result) {
        if (Array.isArray(result) && result.length == 0) {
            return null
        }else {
            // data is there (non-empty array or an single object)
            client.hset(this.hashkey, key, JSON.stringify(result)); // saving data in redis cache
            client.expire(this.hashKey, this.expire);
            console.log('Return data from Redis');
            return result
        }
    } else { // database returned null value
        console.log("data not present")
        return null
    }
};

module.exports = 
    function clearCache(hashkey){
        client.del(JSON.stringify(hashkey))
    }