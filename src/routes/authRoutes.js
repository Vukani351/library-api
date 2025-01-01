const userController = require('../controllers/authController');

async function authRoutes(fastify, options) {
  fastify.get('/google', { preHandler: fastify.authenticate }, userController.googleLogin);
  // Protected route using the 'authenticate' decorator
  // fastify.get('/profile', { preHandler: [fastify.authenticate] }, userController.getProfile);
}

module.exports = authRoutes;