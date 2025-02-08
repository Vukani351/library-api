const bookController = require('../controllers/bookController');

async function bookRoutes(fastify, options) {
  fastify.get('/', bookController.getAllBooks);
  fastify.get('/:id', bookController.getBookById);
  fastify.get('/user', { preHandler: [fastify.authenticate] }, bookController.getUserBooks);
  fastify.post('/create', { preHandler: [fastify.authenticate] }, bookController.addBook);
  fastify.put('/update', { preHandler: [fastify.authenticate] }, bookController.editBook);
  
}

module.exports = bookRoutes;
