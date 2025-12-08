# TravelDataAggregator

A simple Node.js application that aggregates travel data from external APIs and stores it in MongoDB.

## Features

- Fetches country and weather data from external APIs
- Aggregates and displays travel information
- Stores data in MongoDB database
- RESTful API with Express.js backend
- Simple frontend interface

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Frontend:** HTML, CSS, JavaScript

## Getting Started

### Prerequisites

- Node.js installed
- MongoDB running locally or a MongoDB Atlas connection

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your configuration (see `.env` for reference)

### Running the Application

```bash
npm start
```

The server will start on the configured port.

## Project Structure

```
TravelDataAggregator/
├── public/          # Frontend files (HTML, CSS, JS)
├── server.js        # Express server and API routes
├── package.json     # Dependencies and scripts
└── .env             # Environment variables
```

## License

ISC
