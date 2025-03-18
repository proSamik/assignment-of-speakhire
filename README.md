# Survey Application

A full-stack web application for creating and collecting survey responses. Built with React, Express, and PostgreSQL.

## Features

- Create and manage surveys with multiple sections and question types
- Take surveys with a clean, user-friendly interface
- Receive email confirmation after completing a survey
- Dark and light theme support with browser preference detection
- Responsive design for all device sizes
- **Create surveys from markdown files**

## Tech Stack

### Frontend
- React
- TypeScript
- Material UI
- Redux Toolkit
- RTK Query
- React Router

### Backend
- Express
- TypeScript
- PostgreSQL
- Sequelize ORM
- Nodemailer

### Deployment
- Docker
- Docker Compose

## Project Structure

```
.
├── client/                  # React frontend
│   ├── public/              # Static files
│   └── src/                 # Source code
│       ├── components/      # Shared components
│       ├── pages/           # Page components
│       ├── store/           # Redux store and API slices
│       ├── theme/           # Theme configuration
│       ├── types/           # Type definitions
│       └── utils/           # Utility functions
└── server/                  # Express backend
    ├── markdown/            # Markdown files for surveys
    └── src/                 # Source code
        ├── controllers/     # Request handlers
        ├── models/          # Database models
        ├── routes/          # API routes
        ├── services/        # Business logic
        ├── types/           # Type definitions
        └── utils/           # Utility functions
            ├── seedSurveys.ts  # Parser for markdown surveys
            └── runSeed.ts      # Script to run the seeding process
```

## Getting Started

### Prerequisites

- Node.js
- Docker and Docker Compose

### Setup

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd survey-application
   ```

2. Create a `.env` file in the root directory using the provided `.env.example` as a template
   ```bash
   cp .env.example .env
   ```

3. Start the application with Docker Compose
   ```bash
   docker-compose up -d
   ```

4. The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Creating Surveys from Markdown

You can define surveys using markdown format, which will be processed by the seeding script and added to the database.

### Basic Survey Creation

1. Create a markdown file in the `server/markdown/` directory
2. Use the following format:
   - Use `#` for section title
   - Number questions (e.g., `1. Question text?`)
   - Use bullet points (`-`) for options
   - Add question type with double dash (`-- Multiple Choice` or `-- Single Choice` or `-- Text`)
3. Run the seed script with `npm run seed` in the server directory

Example:
```markdown
# Product Experience

1. How long have you been using our product?
- Less than a month
- 1-6 months
- 6-12 months
- More than a year
-- Single Choice

2. How satisfied are you with our product?
- Very satisfied
- Satisfied
- Neutral
- Dissatisfied
- Very dissatisfied
-- Single Choice
```

### Creating Multi-Section Surveys

To create surveys with multiple sections:

1. Create multiple markdown files with a common prefix followed by `_Part1`, `_Part2`, etc.
   - Example: `Customer_Experience_Part1.md`, `Customer_Experience_Part2.md`
2. Each file will become a separate section in the same survey
3. Run the seed script to combine these files into a multi-section survey

For more formatting instructions, see `server/markdown/README.md`.

## Development

### Running Locally

1. Start the PostgreSQL database with Docker
   ```bash
   docker-compose up -d postgres
   ```

2. Install dependencies and start the backend
   ```bash
   cd server
   npm install
   npm run dev
   ```

3. In a new terminal, install dependencies and start the frontend
   ```bash
   cd client
   npm install
   npm start
   ```

## License

MIT