# TravelDataAggregator

A simple Node.js application that aggregates travel data from external APIs and stores it in MongoDB Atlas.

## Features

- Fetches country and weather data from external APIs
- Aggregates and displays travel information
- Stores data securely in MongoDB Atlas cloud database
- RESTful API with Express.js backend
- API Key and OAuth token validation middleware
- Simple responsive frontend interface

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **External APIs:** OpenWeatherMap, GeoDB Cities API

## Getting Started

### Prerequisites

- Node.js (v14 or higher) installed
- MongoDB Atlas account (free tier available at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))
- API keys for external services

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd soc
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory with the following variables:
   
   ```env
   PORT=3000
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority&appName=<ClusterName>
   API_SECRET=your_secret_api_key
   OPENWEATHER_API_KEY=your_openweather_api_key
   GEODB_API_KEY=your_geodb_api_key
   ```

   **Environment Variable Details:**
   - `PORT`: Server port (default: 3000)
   - `MONGODB_URI`: MongoDB Atlas connection string
   - `API_SECRET`: Secret key for API authentication
   - `OPENWEATHER_API_KEY`: API key from [OpenWeatherMap](https://openweathermap.org/api)
   - `GEODB_API_KEY`: API key from [GeoDB Cities](https://rapidapi.com/wirefreethought/api/geodb-cities)

### MongoDB Atlas Setup

1. **Create a MongoDB Atlas Account**
   - Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose the FREE tier (M0 Sandbox)
   - Select your preferred cloud provider and region
   - Click "Create Cluster"

3. **Configure Database Access**
   - Go to "Database Access" in the left menu
   - Click "Add New Database User"
   - Create a username and password (save these!)
   - Grant "Read and write to any database" privileges

4. **Configure Network Access**
   - Go to "Network Access" in the left menu
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for development
   - For production, restrict to specific IPs

5. **Get Connection String**
   - Go to "Database" and click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<database>` with `TravelDataAggregator`

### Running the Application

**Development Mode:**
```bash
npm start
```

The server will start on `http://localhost:3000` and automatically connect to MongoDB Atlas.

**Success Indicators:**
- ✅ MongoDB Atlas Connected Successfully
- Server running on port 3000

## API Endpoints

### Public Endpoints

- **GET `/api/config`** - Get public API configuration
- **GET `/api/records`** - Retrieve all stored travel records

### Protected Endpoints

- **POST `/api/save-data`** - Save aggregated travel data
  - Requires `x-api-key` header
  - Requires `Authorization: Bearer <token>` header

## Project Structure

```
soc/
├── public/              # Frontend files
│   ├── index.html       # Main HTML page
│   ├── style.css        # Styling
│   └── app.js           # Client-side JavaScript
├── server.js            # Express server and API routes
├── package.json         # Dependencies and scripts
├── .env                 # Environment variables (not tracked)
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## Database Schema

**TravelRecord Collection:**
```javascript
{
  country: String,
  capital: String,
  population: Number,
  temperature: Number,
  weatherDescription: String,
  capitalDetails: Mixed,
  storedAt: Date (default: now)
}
```

## Security Features

- API key validation middleware
- OAuth bearer token validation
- Environment variable protection
- CORS enabled for cross-origin requests

## Troubleshooting

**Connection Issues:**
- Verify your MongoDB Atlas IP whitelist includes your current IP
- Check that your database username and password are correct
- Ensure the database name in the connection string is correct

**API Errors:**
- Verify all API keys in `.env` are valid
- Check that external APIs are accessible

## License

ISC
