## Title and Description:

Library API
Creating an application that will allow me to keep records of the books I have, ones i read and the ones that I am reading next. It will be a personal library & allows me to track the books coming in and learnt. It should also allow others to use it to manage their books.

## Authors

- [@Vukani](https://github.com/Vukani351)
- [@More...](https://github.com/)

## Roadmap

## 1. Create Library Api
- Will show all books we have inventory.

## 2. Add Basic Routes (library, books, users)
- Will show all libraries, books and users.

## 3. Library routes
- Allow us to manipulate the data for a library.

## 4. users routes
- Will allow us to manipulate the data for users.

## 5. Books routes
- Will allow us to manipulate the data for books.

## 6. Lend routes
- Will allow us to manipulate the data for lent and returned books.


## Installation
This is the process for running the project on your machine.

## Steps To Create and run a project:
> *all commands written in these steps are done in the command line or an intergrated cmd of your editor*

- 

## Steps to Working On Project:
> Just recording the process I am following including the pitfalls.



## Related

Here are some related projects

[Awesome README](https://github.com/matiassingers/awesome-readme)


## Documentation

[Documentation](https://linktodocumentation)

## Resources:
> This is a list of resources i used for the project adn link I got it from.

- [Fastify](https://fastify.dev/docs/latest/Guides/Getting-Started/) so I have a nodejs framework to help with development.
- [Fastify - MYSQL](https://github.com/fastify/fastify-mysql) for connecting to mysql server.
- [Fastify - JWT](https://github.com/fastify/fastify-jwt) for creating JWT 
- [Fastify - SWAGGER](https://github.com/fastify/fastify-swagger) for adding swagger 
- [DayJS](https://github.com/iamkun/dayjs) for formatting the date correctly.


personal-library/
    ├── src/
    │   ├── controllers/
    │   │   ├── userController.js
    │   │   ├── libraryController.js
    │   │   └── bookController.js
    │   ├── models/
    │   │   ├── userModel.js
    │   │   ├── libraryModel.js
    │   │   └── bookModel.js
    │   ├── routes/
    │   │   ├── userRoutes.js
    │   │   ├── libraryRoutes.js
    │   │   └── bookRoutes.js
    │   ├── config/
    │   │   └── db.js
    │   ├── app.js
    │   └── server.js
    ├── package.json
    ├── Dockerfile
    ├── docker-compose.yml
    └── .env
