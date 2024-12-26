const userController = require('../controllers/userController');

async function userRoutes(fastify, options) {
  fastify.get('/', userController.getUsers);
  fastify.get('/:userId', userController.getUser);
  fastify.post('/create', userController.register);
  fastify.post('/login', userController.login);
  fastify.post('/logout', userController.logout);
  // Protected route using the 'authenticate' decorator
  fastify.get('/profile', { preHandler: [fastify.authenticate] }, userController.getProfile);

}

module.exports = userRoutes;