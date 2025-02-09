
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
![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)  
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
5. Start the development server:  
   ```bash
   npm run dev
   ```

---

## Steps to Work on the Project:
> Record the process being followed, including any challenges and solutions.

---

## Related

Here are some related projects:  

- [Awesome README](https://github.com/matiassingers/awesome-readme)

---

## Documentation

- [Project Documentation](https://linktodocumentation)

---

## Resources:
> This is a list of resources used for the project and links where they were found.

- [Fastify Documentation](https://fastify.dev/docs/latest/Guides/Getting-Started/)  
- [Fastify-MySQL Plugin](https://github.com/fastify/fastify-mysql)  
- [Fastify-JWT Plugin](https://github.com/fastify/fastify-jwt)  
- [Fastify-Swagger Plugin](https://github.com/fastify/fastify-swagger)  
- [DayJS Library](https://github.com/iamkun/dayjs)

---

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



---

## Todo:

- Remove express & use fastify for a change.
- Add a reply decorator for standardizing responses.
- Create and test the docker file for running the application build.
- add docker-compose file for running mysql, PHPMyAdmin & nodejs smne time.[]
- deploy this to google cloud [-]
