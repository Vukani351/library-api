const Library = require('../models/libraryModel');
const User = require('../models/userModel');

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
    const { id } = request.params;
    const libraries = await Library.findOne({ where: { user_id: id } });
    reply.code(200).send(libraries);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.editLibrary = async (request, reply) => {
  try {
    const userId = request.user.id;
    const { id, name, description, user_id } = request.body;
    const user = await User.findByPk(userId);
    const body_defined_user = await User.findByPk(user_id);
    if (!(user && body_defined_user)) {
      return reply.code(404).send({ error: 'User not found for this library.' });
    }

    const previous_library_data = await Library.findByPk(id);
    
    if (!previous_library_data) {
      return reply.code(404).send({ error: 'This library does not exist.' });
    }
    
    await Library.update(
      {
        name: name, description: description, user_id: user_id
      },
      {
        where: { 
          id: previous_library_data.id, user_id: user_id
      }
    });

    reply.code(201).send(await Library.findByPk(id));
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};