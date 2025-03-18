# Survey Responses Viewer

This is a simple tool to view formatted survey responses from the API with pagination.

## How to Use

1. Start the server by running `npm run dev` from the server directory
2. Access the viewer at `http://localhost:5000/responses-viewer`
3. Select a survey from the dropdown (or keep "All Surveys" to view responses from all surveys)
4. Choose how many items to display per page
5. Click "Load Responses" to fetch and display the responses

## Features

- View all responses or filter by specific survey
- Paginate through responses
- See respondent details (name, email, submission time)
- View formatted questions and answers
  - Text responses shown directly
  - Single-choice selections show the option text
  - Multiple-choice selections show a bulleted list of selected options

## API Endpoints

The viewer uses the following API endpoints:

- `GET /api/surveys` - Fetch all available surveys
- `GET /api/responses/formatted` - Fetch all formatted responses with pagination
- `GET /api/responses/survey/:surveyId/formatted` - Fetch formatted responses for a specific survey with pagination

Query parameters for pagination:
- `page` - Page number (default: 1)
- `limit` - Number of items per page (default: 10)

## Response Format

The API returns formatted responses in the following structure:

```json
{
  "responses": [
    {
      "id": "123-456-789",
      "surveyTitle": "Example Survey",
      "name": "John Doe",
      "email": "john@example.com",
      "responses": [
        {
          "question": "What is your favorite color?",
          "questionType": "single",
          "answer": "Blue"
        },
        {
          "question": "Which programming languages do you use?",
          "questionType": "multiple",
          "answer": ["JavaScript", "TypeScript", "Python"]
        }
      ],
      "submittedAt": "2023-05-01T12:34:56.789Z"
    }
  ],
  "pagination": {
    "totalItems": 25,
    "totalPages": 3,
    "currentPage": 1,
    "pageSize": 10
  }
}
``` 