const { where } = require('sequelize');
const User = require('../models/userModel');

exports.getUsers = async (request, reply) => {
  try {
    // const { name, email, password } = request.body;
    const users = await User.findAll();
    reply.code(201).send(users);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.getUser = async (request, reply) => {
  try {
    // to get user by password - const project:
    //  await Project.findOne({ where: { title: 'My Title' } });
    const { userId } = request.params;
    // your code here
    console.log("testing links: ", userId);
    // const { name, email, password } = request.body;
    const user = await User.findOne({ userId: userId });
    reply.code(201).send(user);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.createUser = async (request, reply) => {
  const updated_at = Date();
  const created_at = Date();

  try {
    const { name, email, password } = request.body;
    console.log("user data: ", name, email, password);
    const user = await User.create({ name: name, email: email, password: password});
    reply.code(201).send(user);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.login = async (request, reply) => {
  try {
    // let user login then provide them with a JWT token.
    const { name, password } = request.params;
    // your code here
    console.log("testing links: ", userId);
    
    const users = await User.findAll();
    reply.code(201).send(users);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.logout = async (request, reply) => {
  try {
    // your code here
    
    reply.code(201).send("success");
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

