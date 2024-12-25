const userController = require('../controllers/userController');

async function userRoutes(fastify, options) {
  fastify.post('/create', userController.createUser);
  fastify.get('/', userController.getUsers);
}
// fastify.get('/:id', userController.getUsers);

module.exports = userRoutes;
