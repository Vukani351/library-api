
## Title and Description:

**Library API**  
Creating an application that will allow me to keep records of the books I have, ones I read, and the ones that I am reading next. It will be a personal library and allow me to track the books coming in and learned. It should also allow others to use it to manage their books.

---

## Authors

- [@Vukani](https://github.com/Vukani351)  
- [@More...](https://github.com/)

---

## Languages and Frameworks Used

### Languages  
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)  
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

### Frameworks and Libraries  
![NestJS](https://docs.nestjs.com/assets/logo-small-gradient.svg)  
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)  
![Day.js](https://img.shields.io/badge/Day.js-FF5F00?style=for-the-badge&logo=javascript&logoColor=white)

---

## Roadmap

### 1. Create Library API  
- Display all books in inventory.

### 2. Add Basic Routes (Library, Books, Users)  
- Implement endpoints for managing libraries, books, and users.

### 3. Library Routes  
- Enable CRUD operations for library data.

### 4. User Routes  
- Manage user data through API endpoints.

### 5. Book Routes  
- Handle CRUD operations for books.

### 6. Lending Routes  
- Manage the lending and returning of books.

---

## Installation

### Steps To Create and Run the Project:
> *All commands in these steps should be executed in the command line or an integrated terminal of your editor.*

1. Clone the repository:

```bash
   git clone https://github.com/your-repository-url.git
```
2. Navigate to the project directory:  
```bash
   cd personal-library
```
3. Install dependencies:  
```bash
   npm install
```
4. Configure the environment variables in `.env`.
5. Run the initial migration script:
```shell
   npm run db:init # runs only the new migrations
```
After running the command i do recommend you go check the database 'library_db' actually exists.
6. Start the development server:

```bash
   npm run dev
```

---

## Steps to Work on the Project:
> Record the process being followed, including any challenges and solutions.

---

## Related

Here are some related projects:  

- [Front End Repo](https://github.com/Vukani351/bookeeper)

---

## Dev Tools

- [mysql Workbench](https://www.mysql.com/products/workbench/)
- [Install My SQL](https://dev.mysql.com/downloads/installer/)
- [Post Man](https://www.postman.com/)
- [Nestjs route List (VS code extension)](https://marketplace.visualstudio.com/items?itemName=PedroAzevedo.nestjs-route-list)

---

## Resources:
> This is a list of resources used for the project and links where they were found.

- [NestJS Documentation](https://docs.nestjs.com/first-steps)  
- [Sequelize ORM Docs](https://sequelize.org/docs/v6/getting-started/)  
- [Sequelize-MySQL Plugin](https://docs.nestjs.com/techniques/database)  
- [NestJS-JWT Plugin](https://docs.nestjs.com/security/authentication#authentication)  
- [NestJS-Swagger Plugin](https://github.com/fastify/fastify-swagger)  
- [DayJS Library](https://github.com/iamkun/dayjs)
- [Cloudinary Doc's](https://cloudinary.com/documentation/node_integration)

-------

## Project Structure

```plaintext
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
```
## Docker Commands:

- How to run the project on docker
>

- Building & running the image:
> docker-compose up --build

------
1. Process for Handling Model Changes and Migrations
- When a developer modifies or adds a model in the models directory, they should ensure the Sequelize model reflects the desired database schema. I mean to say after seeing the need, simply generate the migration and abd run it, then add the item in the `database/library.sql` file so that when the next person initialises their DB they dont need to even run migrations.

2. Generate a Migration:
- Use Sequelize CLI to generate a migration file for the changes

```bash
   npx sequelize-cli migration:generate --name meaningful-migration-name
```

- This will create a new migration file in the migrations directory.

3. Edit the Migration File:
 - Add the necessary `up` and `down` methods to apply and revert the changes. For example:

```js
   // filepath: src/database/migrations/<timestamp>-add-column-example.js
   module.exports = {
      up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn('table_name', 'column_name', {
         type: Sequelize.STRING,
         allowNull: true,
      });
      },
      down: async (queryInterface) => {
      await queryInterface.removeColumn('table_name', 'column_name');
      },
   };
```

4. **Run Migrations Locally**:
- Apply the migrations to your local database:

```bash
   npx sequelize-cli db:migrate
```

5. **Test the Changes**:
 - Verify that the changes work as expected in your local environment.

6. **Commit and Push**:
 - Commit the updated models and migration files to the repository.

---

#### **Modify Deployment Workflow**
In your GitHub Actions workflow (`.github/workflows/deploy.yaml`), ensure migrations are run during deployment:
```yaml
- name: Run database migrations
  run: npm run migrate:prod
```

---

### **3. Automating Migrations Locally**

To simplify local development, you can create a script to run migrations automatically when starting the application:

#### **Update main.ts**
Modify the `bootstrap` function to include migrations:

```ts
   import { NestFactory } from '@nestjs/core';
   import { AppModule } from './app.module';
   import * as dotenv from 'dotenv';
   import { exec } from 'child_process';

   async function bootstrap() {
   const environment = process.env.NODE_ENV || 'development';
   dotenv.config({ path: `.env.${environment}` });

   // Run migrations before starting the app
   exec('npx sequelize-cli db:migrate', (error, stdout, stderr) => {
      if (error) {
         console.error(`Migration error: ${error.message}`);
         return;
      }
      if (stderr) {
         console.error(`Migration stderr: ${stderr}`);
         return;
      }
      console.log(`Migration stdout: ${stdout}`);
   });

   const app = await NestFactory.create(AppModule);
   app.enableCors();
   await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
   }
   bootstrap();
```

---

### **4. Best Practices**

1. **Migration Naming**:
   - Use descriptive names for migrations (e.g., `add-thumbnail-to-library`).

2. **Review Migrations**:
   - Always review migration files before running them to ensure they match the intended changes.

3. **Rollback Support**:
   - Ensure the `down` method in migrations can revert changes cleanly.

4. **Environment-Specific Configurations**:
   - Use .env files to manage database credentials for different environments (development, production).

5. **Database Backups**:
   - Before running migrations in production, ensure you have a backup of the database.

---

## Todo:

- we need user groups, people can either be owners or readers from a library. this means we might need a user group that is allowed to access a certain library[] 
- Remove express & use fastify for a change. [x]
- Add a reply decorator for standardizing responses.[]
- Create and test the docker file for running the application build.[0]
- add docker-compose file for running mysql, PHPMyAdmin & nodejs smne time.[0]
- deploy this to AWS [x]
- Add logic for DTO's []
- use Dto [] 
- add logic to track that user has already borrowed the book - borrow buttons should not show