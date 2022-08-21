'use strict';

class BaseMongoCollection {
    constructor(COLLECTION_NAME) {
        this.collection = COLLECTION_NAME;
        this._collection = MONGODB_CONNECTOR.collection(COLLECTION_NAME);
    }
    async find(filter, options) {
        return await this._collection.find(filter, options);
    }
    async insertOne(doc, options) {
        return await this._collection.insertOne(doc, options);
    }
    async updateOne(filter, update, options) {
        return await this._collection.updateOne(filter, update, options);
    }
};

module.exports = BaseMongoCollection;