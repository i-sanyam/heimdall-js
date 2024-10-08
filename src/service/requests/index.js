'use strict';

const Mongo = require('../../mongo');
const { requestStatusesEnum } = require('../../utils/constants');

const addUserRequest = async (userId, resourceId) => {
    return await Mongo.Requests.insertOne({
        requestRaisedBy: new Mongo.__ObjectId(userId),
        resourceId: new Mongo.__ObjectId(resourceId),
        status: requestStatusesEnum.OPEN,
    });
}

const getUserRequests = async (userId, status, resourceId) => {
    const findParams = {
        requestRaisedBy: new Mongo.__ObjectId(userId),
    };
    if (resourceId) {
        findParams.resourceId = new Mongo.__ObjectId(resourceId);
    }
    if (status) {
        findParams.status = status;
    }
    return await Mongo.Requests.find(findParams);
};

const getUserRequestById = async (params, options) => {
    const { userId, requestId, status, resourceId } = params;
    const findParams = {
        _id: new Mongo.__ObjectId(requestId),
        requestRaisedBy: new Mongo.__ObjectId(userId),
    };
    if (status) {
        findParams.status = status;
    }
    if (resourceId) {
        findParams.resourceId = new Mongo.__ObjectId(resourceId);
    }
    return await Mongo.Requests.find(findParams, options);
};

const deleteRequestById = async (params) => {
    const { userId, requestId } = params;
    return await Mongo.Requests.updateOne({
        _id: new Mongo.__ObjectId(requestId),
        requestRaisedBy: new Mongo.__ObjectId(userId),
    }, {
        $set: { status: requestStatusesEnum.DELETED },
    });
};

const rejectRequestById = async (params) => {
    const { userId, requestId } = params;
    return await Mongo.Requests.updateOne({
        _id: new Mongo.__ObjectId(requestId),
        requestRaisedBy: new Mongo.__ObjectId(userId),
    }, {
        $set: { status: requestStatusesEnum.REJECTED },
    });
};

const getRequestsWithResourceDetails = async (params, options) => {
    const { requestIdsArray = [], resourceGroupIds = [], status } = params;

    const lookup = {
        from: 'resources',
        localField: 'resourceId',
        foreignField: '_id',
        as: 'resourceDetails',
    };

    const requestMatch = {};
    if (status) {
        requestMatch.status = status;
    }
    if (requestIdsArray && requestIdsArray.length !== 0) {
        requestMatch._id = { 
            $in: requestIdsArray.map((requestId) => {
                return new Mongo.__ObjectId(requestId);
            }),
        };
    }

    const resourceMatch = {};
    if (resourceGroupIds && resourceGroupIds.length !== 0) {
        resourceMatch['resourceDetails.resourceGroupsArray'] = {
            $in: resourceGroupIds.map((resourceGroupId) => {
                return new Mongo.__ObjectId(resourceGroupId);
            }),
        };
    }

    const pipeline = [{ $lookup: lookup }];

    if (Object.keys(requestMatch).length !== 0) {
        pipeline.unshift({ $match: requestMatch });
    }
    if (Object.keys(resourceMatch).length !== 0) {
        pipeline.push({ $match: resourceMatch });
    }
    return await Mongo.Requests.aggregate(pipeline);
};

module.exports = {
    addUserRequest,
    deleteRequestById,
    getRequestsWithResourceDetails,
    getUserRequests,
    getUserRequestById,
    rejectRequestById,
};