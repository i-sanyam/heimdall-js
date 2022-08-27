const Router = require('express').Router();

// Router.use('/admin', require('./adminRequests'));
Router.use('/resource', require('./resources'));
Router.use('/request', require('./requests'));
Router.use('/user', require('./user'));
// Router.use('/admin/request', require('./adminRequests'));
Router.use('/oauth', require('./oauth'));

module.exports = Router;
