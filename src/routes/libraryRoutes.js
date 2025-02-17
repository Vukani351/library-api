const libraryController = require('../controllers/libraryController');

async function libraryRoutes(fastify, options) {
  fastify.post('/create', libraryController.createLibrary);
  fastify.get('/all', libraryController.getLibraries);
  fastify.get('/:id/:name', { preHandler: [fastify.authenticate] }, libraryController.getUserLibrary);
  fastify.put('/edit', { preHandler: [fastify.authenticate] }, libraryController.editLibrary);
}

module.exports = libraryRoutes;
