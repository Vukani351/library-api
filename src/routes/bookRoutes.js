const bookController = require('../controllers/bookController');

async function bookRoutes(fastify, options) {
  fastify.get('/', bookController.getAllBooks);
  fastify.get('/:id', bookController.getBookById);
  fastify.get('/user', { preHandler: [fastify.authenticate] }, bookController.getUserBooks);
  fastify.post('/create', { preHandler: [fastify.authenticate] }, bookController.addBook);
  fastify.put('/update', { preHandler: [fastify.authenticate] }, bookController.editBook);

  // fastify.get('/borrowed', { preHandler: [fastify.authenticate] }, bookController.getBorrowedBook);
  // fastify.post('/borrow', { preHandler: [fastify.authenticate] }, bookController.getBorrowedBook);
  // fastify.put('/return', { preHandler: [fastify.authenticate] }, bookController.returnBook);
  // fastify.post('/lend', { preHandler: [fastify.authenticate] }, bookController.lendBook);
}

module.exports = bookRoutes;
