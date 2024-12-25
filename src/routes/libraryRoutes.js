const libraryController = require('../controllers/libraryController');

async function libraryRoutes(fastify, options) {
  fastify.post('/create', libraryController.createLibrary);
  fastify.get('/', libraryController.getLibraries);
}

module.exports = libraryRoutes;
