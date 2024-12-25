const bookController = require('../controllers/bookController');

async function bookRoutes(fastify, options) {
  fastify.post('/create', bookController.addBook);
  fastify.get('/', bookController.getBooks);
}

module.exports = bookRoutes;
