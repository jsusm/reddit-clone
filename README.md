# Reddit clone
In this project i want to replicate the basic reddit functionality
( create posts, and comment it and reply )

The main goal of the project was to implement an authentication system using jwt, create crude operations for database models, create an API using REST constraints, return the appropriate error messages, and create tests to make sure everything works as expected.

### Technologies
 - Typescript ( swc for transpile )
 - express
 - zod
 - prisma
 - jest and supertest

### Setup
You need nodejs, npm and docker installed in your machine.
```bash
npm install
```
### Run the project
```bash
# To run the project start the database
docker compose up -d db
# Build and run the project
npm run build
npm run start
```

### Test the app
Start the test database
```bash
npm run docker:test-db-up
# or
docker compose up testdb
```
To run integration test run
```bash
npm run test:integration
```
To run unit tests run
```bash
npm run test
```
### Api schema
 - `/api/v1/auth/singup` -> Create an user and returns auth token
 - `/api/v1/auth/singin` -> returns auth token
 - `/api/v1/posts` -> CRUD operations with posts
 - `/api/v1/posts/:id/comments` -> Reads and creates post's comments
 - `/api/v1/comments/:id` -> Deletes and updates post's comments
 - `/api/v1/comments/:id/reply` -> Creates a new reply
