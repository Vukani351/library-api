const Library = require('../models/libraryModel');

exports.createLibrary = async (request, reply) => {
  try {
    const { name, userId } = request.body;
    const library = await Library.create({ name: name, user_id: userId });
    reply.code(201).send(library);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.getLibraries = async (request, reply) => {
  try {
    const libraries = await Library.findAll();
    console.log(libraries.every(libraries => libraries instanceof Library))
    reply.code(200).send(libraries);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.getUserLibrary = async (request, reply) => {
  try {
    // need to check if the params are there and if user is correct one 
    const { name, id } = request.params;
    const libraries = await Library.findOne({ where: { name: name, user_id: id } });
    console.log("library: ", libraries);;
    reply.code(200).send(libraries);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};