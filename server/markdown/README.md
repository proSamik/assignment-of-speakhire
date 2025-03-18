# Markdown Survey Format

This directory contains markdown files that are used to create surveys in the database.

## Format Guidelines

Each markdown file should follow this format:

- Use a top-level heading (`#`) for the section title
- Number each question (e.g., `1.`, `2.`, etc.)
- Use bullet points (`-`) for answer options
- Specify the question type at the end with double dash (`--`):
  - `-- Single Choice` - Only one option can be selected
  - `-- Multiple Choice` - Multiple options can be selected
  - `-- Text` - Free text input (no options needed)
  - `-- Range` - Numeric slider with min and max values (format: min → max)

Example:

```markdown
# Customer Information

1. What is your age group?
- Under 18
- 18-24
- 25-34
- 35-44
- 45-54
- 55+
-- Single Choice

2. Which of our products do you use? (Select all that apply)
- Product A
- Product B
- Product C
- Product D
-- Multiple Choice

3. Please tell us more about your experience with our products.
-- Text

4. How likely are you to recommend our products to others?
- 0 (Not likely at all) → 10 (Extremely likely)
-- Range
```

## Creating Multi-Section Surveys

To create a survey with multiple sections:

1. Create multiple markdown files with a common prefix followed by `_Part1`, `_Part2`, etc.
   - Example: `Customer_Experience_Part1.md`, `Customer_Experience_Part2.md`
2. Each file will become a separate section in the same survey
3. The files will be combined in alphanumeric order, so naming is important
4. The survey title will be derived from the common prefix

Example filename structure:
- `Employee_Satisfaction_Part1.md` (First section)
- `Employee_Satisfaction_Part2.md` (Second section)
- `Employee_Satisfaction_Part3.md` (Third section)

These would create a single survey titled "Employee Satisfaction" with three sections.

## Automatic Survey Seeding

The system automatically processes markdown files in this directory when the server starts (via `npm run build`, `npm run start`, or `npm run dev`). This ensures that surveys are always up-to-date with the latest markdown content.

### Version Control for Surveys

The system tracks changes to markdown files and automatically updates the survey database:

1. **Adding a new markdown file**: Creates a new survey in the database
2. **Modifying a markdown file**: Creates a new version of the survey while marking the old version as inactive
3. **Deleting a markdown file**: Marks the corresponding survey as inactive in the database

This versioning system ensures that:
- Users always see the latest version of each survey
- Data integrity is maintained for completed surveys
- Changes to surveys don't affect historical response data

## Automatic Database Schema Updates

The system automatically handles all database schema changes and data migrations when the server starts. This fully automated process:

1. Detects and adds any missing columns to the database with appropriate default values
2. Updates existing survey records with meaningful values
3. Ensures backward compatibility with existing surveys and survey responses

You never need to run any migration commands manually - everything is handled automatically during server startup.

## File Naming Conventions

- Filenames translate to survey titles (underscores become spaces)
- Example: `Customer_Feedback.md` becomes a survey titled "Customer Feedback"
- For multi-section surveys, use the format: `Survey_Name_Part1.md`, `Survey_Name_Part2.md`, etc.

## Manual Seeding

You can also manually trigger the seed process (including automatic migrations) by running:

```
npm run seed
```

## Important Notes

- Each standalone markdown file becomes a separate survey
- Files that follow the multi-section naming pattern will be combined into one survey
- All questions are required by default
- The survey title is generated from the filename (without the `_Part#` suffix for multi-section surveys)
- The README.md file in this directory is ignored by the seeding process
- Only active (latest version) surveys are shown to users 