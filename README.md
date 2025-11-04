# Natours (EJS Edition)

A Node.js, Express, and MongoDB application that powers the “Natours” travel API and server-rendered website. This codebase follows the curriculum from the Udemy course [Node.js, Express, MongoDB & More: The Complete Bootcamp 2023](https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/), with the key difference that all server-side rendering is implemented using **EJS templates** instead of Pug. The repository is public to help other students who prefer EJS.

## Features

- RESTful API for tours, users, reviews, and authentication.
- JWT-based auth with secure cookie handling, rate limiting, sanitization, and HPP protection.
- Geo queries for distance calculations and “tours within” searches.
- Reusable CRUD factories and modular controllers.
- EJS-powered views for overview and tour detail pages, backed by shared layouts and partials.
- Static assets served from `/public` (CSS, images, legacy HTML).

## Getting Started

```bash
npm install
npm run dev          # runs nodemon server
npm run start        # production nodemon server
```

Ensure you create a `.env` (or `config.env`) file with the required settings (DB connection string, JWT secrets, cookie expiry, etc.).

## Folder Structure

- `app.js`: Express app configuration, security middleware, routes.
- `server.js`: Entry point that starts the HTTP server.
- `controllers/`: All controller logic (auth, tours, reviews, users, views).
- `models/`: Mongoose schemas for Tours, Users, Reviews.
- `routes/`: API and view routers.
- `utils/`: Helpers (API features, error handling, email, cookie constants).
- `views/`: EJS templates (`base`, `header`, `footer`, `overview`, `tour`, `card`).
- `public/`: Static assets served to the client.

## EJS Templates

Server-side rendering now uses EJS:

- `views/base.ejs`: Layout template with header/footer partials.
- `views/overview.ejs`: Renders all tours (cards include `card.ejs` partial).
- `views/tour.ejs`: Detailed view of a single tour with reviews.

## API Highlights

- `GET /api/v1/tours`: List tours with filtering, sorting, limiting fields, and pagination.
- `GET /api/v1/tours/tours-within/:distance/center/:latlng/unit/:unit`: Geospatial search.
- `GET /api/v1/tours/distances/:latlng/unit/:unit`: Distance calculations.
- `POST /api/v1/users/signup` & `/login`: Auth endpoints.
- `PATCH /api/v1/users/updateMyPassword`: Authenticated password updates.
- `/api/v1/reviews`: Nested review routes (requires authentication).

## Security / Best Practices

- `helmet` for secure HTTP headers.
- `express-rate-limit` to limit requests per IP.
- `express-mongo-sanitize`, `xss-clean`, and `hpp` to guard against NoSQL injection, cross-site scripting, and parameter pollution.
- Cookie options tuned for production; remember to set `NODE_ENV` appropriately.

## Contributing / Learning

Feel free to clone or fork the project as a reference while following the Udemy bootcamp. Contributions, questions, or improvements (especially around the EJS view layer) are welcome.