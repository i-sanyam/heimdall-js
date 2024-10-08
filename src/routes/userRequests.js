'use strict';

const userRequestsRouter = require('express').Router();
const _ = require('underscore');

const constants = require('../utils/constants');
const userMiddleware = require('../middlewares/user');
const ExpressRouteHandler = require('./routeHandler');

const requestService = require('../service/requests');
const resourceService = require('../service/resources');

userRequestsRouter.use(userMiddleware.verifyUser);

userRequestsRouter.get('/', ExpressRouteHandler(async (req) => {
	const userId = req.userData._id.toString();
	const requests = await requestService.getUserRequests(userId);
	return [{ data: { requests } }];
}));

userRequestsRouter.post('/', ExpressRouteHandler(async (req) => {
	const resourceId = req.body.resourceId;
	if (!resourceId) {
		return [{ status: 400, message: 'Resource Id not present' }]
	}

	const resourceData = await resourceService.getResourceById(resourceId);
	if (_.isEmpty(resourceData)) {
		return [{ status: 404, message: 'Invaid Resource Id' }];
	}

	const userId = req.userData._id.toString();
	const existingUserRequests = await requestService.getUserRequests(userId, constants.requestStatusesEnum.OPEN, resourceId);
	if (!_.isEmpty(existingUserRequests)) {
		return [{ status: 409, message: 'Request Already Raised' }];
	}

	await requestService.addUserRequest(userId, resourceId);
	return;
}));

userRequestsRouter.delete('/', ExpressRouteHandler(async (req) => {
	const userId = req.userData._id.toString();
	const requestId = req.body.requestId;
	if (!requestId) {
		return [{ status: 400, message: 'Request Id not present' }]
	}

	const existingUserRequests = await requestService.getUserRequestById({ userId, requestId });
	if (_.isEmpty(existingUserRequests)) {
		return [{ status: 404, message: 'Request Not Found' }];
	}
	const existingUserRequest = existingUserRequests[0];
	if (existingUserRequest.status !== constants.requestStatusesEnum.OPEN) {
		return [{ status: 405, message: 'Invalid Request Status for deletion' }];
	}
	
	await requestService.deleteRequestById({ userId, requestId });
	return;
}));

module.exports = userRequestsRouter;