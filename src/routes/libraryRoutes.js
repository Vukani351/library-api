const libraryController = require('../controllers/libraryController');

async function libraryRoutes(fastify, options) {
  // get methods
  fastify.get(
    '/all',
    libraryController.getUserAccessLibraries
  );
  fastify.get(
    '/:id',
    {
      preHandler: 
        [
          fastify.authenticate
        ]
    },
    libraryController.getUserLibrary
  );

  // post methods
  fastify.post(
    '/create',
    {
      preHandler: 
      [
        fastify.authenticate
      ]
    },
    libraryController.createLibrary
  );

  fastify.post(
    '/request',
    {
      preHandler: 
      [
        fastify.authenticate
      ]
    },
    libraryController.requestLibraryAccess
  );

  // put methods
  fastify.put(
    '/edit',
    {
      preHandler: 
      [
        fastify.authenticate
      ]
    },
    libraryController.editLibrary
  );
}

module.exports = libraryRoutes;
