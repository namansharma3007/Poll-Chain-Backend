# Web3 Polling App Backend

This is the backend service for the Web3 Polling Application. Built with TypeScript and Express.js, this project handles user authentication, poll management, avatar uploads, and other backend operations. It integrates various libraries and services to ensure secure and efficient data handling and storage.

## Frontend Repository

The frontend for this project is managed separately and provides the user interface that interacts with this backend.

Check out the frontend repository here: https://github.com/namansharma3007/Poll-Chain-frontend


## Features

- **RESTful API**:  
  Provides endpoints for user management, poll creation, voting, and search functionalities.

- **User Authentication**:  
  Secure authentication using JSON Web Tokens (JWT) combined with password hashing via bcrypt.

- **File Uploads**:  
  Handle avatar uploads and updates using Multer, with images stored and managed via Cloudinary.

- **Database Integration**:  
  Uses Mongoose to interact with MongoDB for data persistence.

- **Middleware**:
  - **cookie-parser**: Manage cookies for user sessions.
  - **cors**: Enable Cross-Origin Resource Sharing.
  - **Multer**: Process multipart/form-data for file uploads.

## Tech Stack

- **Express.js** – Web framework for Node.js to build the API.
- **TypeScript** – Strongly typed language that builds on JavaScript for better maintainability.
- **bcrypt** – Library for hashing passwords securely.
- **cookie-parser** – Middleware for handling cookies.
- **cors** – Middleware to enable Cross-Origin Resource Sharing.
- **Multer** – Middleware for handling multipart/form-data (file uploads).
- **Cloudinary** – Cloud-based image management service.
- **Mongoose** – ODM (Object Data Modeling) library for MongoDB.

## Installation

1. **Clone the Repository**

```bash
git clone https://github.com/namansharma3007/Poll-Chain-frontend.git
cd Poll-Chain-frontend
```

2. **Install Dependencies**

```bash
npm install
```

3. **Start the Server**

   It will build typescript and start the server

```bash
npm run start
```
The server will run on the port specified in your environment variables (default is usually 5555).

## Environment Variables

Create a `.env` file in the root directory and configure the following variables as needed:

```bash
REFRESH_TOKEN_SECRET
ACCESS_TOKEN_SECRET
ACCESS_TOKEN_EXPIRY
REFRESH_TOKEN_EXPIRY
MONGO_URI
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
DEFAULT_AVATAR_URL=<set a default avatar url>
ACCESS_ORIGIN_URL=<frontend url>
```

Customize these variables to match your configuration and secrets.

## API endpoints
### User Authentication
- **POST /api/v1/auth/singup** - Register a new user.
- **POST /api/v1/auth/login** - Authenticate a user and issue a JWT.
- **POST /api/v1/auth/logout** - Logout a user and clear cookies.

### Session Management
- **GET /api/v1/auth/check-session** - Verifies access token
- **POST /api/v1/auth/refresh-token** - Refreshes access token if it is expired

### Update User
- **PATCH /api/v1/auth/update-profile** - Updates user credentials

### User Info
- **GET /api/v1/auth/get-active-users** - Returns active users on the Poll Chain

## Contributing

Contributions are welcome! If you have any ideas or find bugs, feel free to fork the repository and open a pull request with your suggestions.

1. Fork the repository.
2. Create a new branch `git checkout -b feature/your-feature`.
3. Make your changes and commit them `git commit -m 'Add some feature'`.
4. Push to the branch `git push origin feature/your-feature`.
5. Open a pull request.