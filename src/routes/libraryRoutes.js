const libraryController = require('../controllers/libraryController');

async function libraryRoutes(fastify, options) {
  fastify.post('/create', libraryController.createLibrary);
  fastify.get('/libraries', libraryController.getLibraries);
  fastify.get('/:id/:name', { preHandler: [fastify.authenticate] }, libraryController.getUserLibrary);
}

module.exports = libraryRoutes;
