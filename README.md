# Survey Application

A full-stack web application for creating and collecting survey responses. Built with React, Express, and PostgreSQL.

## Features

- Create and manage surveys with multiple sections and question types
- Take surveys with a clean, user-friendly interface
- Receive email confirmation after completing a survey
- Dark and light theme support with browser preference detection
- Responsive design for all device sizes
- **Create surveys from markdown files**
- **Automatic survey versioning** when content changes

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
├── server/                  # Express backend
│   ├── markdown/            # Markdown files for surveys
│   └── src/                 # Source code
│       ├── controllers/     # Request handlers
│       ├── models/          # Database models
│       ├── routes/          # API routes
│       ├── services/        # Business logic
│       ├── types/           # Type definitions
│       └── utils/           # Utility functions
│           ├── seedSurveys.ts  # Parser for markdown surveys
│           └── runSeed.ts      # Script to run the seeding process
└── secrets/                 # Secret credentials for SMTP (required for Docker deployment)
    ├── smtp_user.txt        # SMTP username
    └── smtp_pass.txt        # SMTP password
```

## Getting Started

### Prerequisites

- Node.js (for local development)
- Docker and Docker Compose (for containerized deployment)

### Local Development Setup

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd assignment-of-speakhire
   ```

2. Start PostgreSQL using Docker
   ```bash
   docker-compose up -d postgres
   ```

3. Install and start the backend
   ```bash
   cd server
   npm install
   npm run dev
   ```

4. In a new terminal, install and start the frontend
   ```bash
   cd client
   npm install
   npm start
   ```

5. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

### Docker Deployment

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd assignment-of-speakhire
   ```

2. Create the secrets directory and add SMTP credentials
   ```bash
   mkdir -p secrets
   echo "your-smtp-username" > secrets/smtp_user.txt
   echo "your-smtp-password" > secrets/smtp_pass.txt
   ```

3. Start the application with Docker Compose
   ```bash
   docker-compose up -d
   ```

4. The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

5. To view logs from the containers
   ```bash
   docker-compose logs -f
   ```

6. To stop the application
   ```bash
   docker-compose down
   ```

7. To stop the application and remove the database volume
   ```bash
   docker-compose down -v
   ```

## Creating Surveys from Markdown

You can define surveys using markdown format, which will be processed by the seeding script and added to the database.

### Basic Survey Creation

1. Create a markdown file in the `server/markdown/` directory
2. Use the following format:
   - Use `#` for section title
   - Number questions (e.g., `1. Question text?`)
   - Use bullet points (`-`) for options
   - Add question type with double dash (`-- Multiple Choice` or `-- Single Choice` or `-- Text` or `-- Range`)
3. The server will automatically detect and process markdown files when it starts

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

3. How likely are you to recommend our product?
- 0 (Not likely at all) → 10 (Extremely likely)
-- Range
```

### Creating Multi-Section Surveys

To create surveys with multiple sections:

1. Create multiple markdown files with a common prefix followed by `_Part1`, `_Part2`, etc.
   - Example: `Customer_Experience_Part1.md`, `Customer_Experience_Part2.md`
2. Each file will become a separate section in the same survey
3. The system will automatically combine these files into a multi-section survey
4. Files are sorted alphanumerically to determine section order

For more detailed formatting instructions, see `server/markdown/README.md`.

## Environment Configuration

The application uses the following environment variables, which are set in the docker-compose.yml file:

### Server Environment Variables
- `PORT`: Server port (default: 5001)
- `NODE_ENV`: Environment mode (development/production)
- `DATABASE_URL`: PostgreSQL connection string
- `CLIENT_URL`: URL of the client application
- `SMTP_HOST`: SMTP server for sending emails
- `SMTP_PORT`: SMTP port
- `SMTP_FROM`: Email address to send from

### SMTP Configuration
For email functionality, SMTP credentials are stored as Docker secrets:
- `smtp_user`: SMTP username file in the secrets directory
- `smtp_pass`: SMTP password file in the secrets directory

## Database Information

The application uses PostgreSQL 14 for data storage:
- Database name: survey_app
- Username: postgres
- Password: postgres (for development only)
- Port: 5432

Data is persisted through a Docker volume named `pgdata`.

## License

MIT