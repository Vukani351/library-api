const bookController = require('../controllers/bookController');

async function bookRoutes(fastify, options) {
  fastify.get('/', bookController.getBooks);
  fastify.get('/user/:bookId', { preHandler: [fastify.authenticate] }, bookController.getUserBooks);
  fastify.post('/create', bookController.addBook);
  fastify.put('/edit', { preHandler: [fastify.authenticate] }, bookController.editBook);
  
}

module.exports = bookRoutes;
