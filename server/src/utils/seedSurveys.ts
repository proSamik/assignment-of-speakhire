/**
 * This script parses markdown files and creates surveys in the database
 */

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { connectDB } from '../models/db';
import Survey from '../models/survey.model';

interface QuestionOption {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  type: 'single' | 'multiple' | 'text';
  required: boolean;
  options?: QuestionOption[];
}

interface Section {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

interface SurveyData {
  title: string;
  description?: string;
  sections: Section[];
}

/**
 * Parses a markdown file containing a survey section
 * @param filePath - Path to the markdown file
 * @returns Parsed section with questions and options
 */
function parseMarkdownSection(filePath: string): Section {
  const markdown = fs.readFileSync(filePath, 'utf-8');
  const lines = markdown.split('\n').filter(line => line.trim() !== '');
  
  // Get the section title from the first line (# heading)
  const titleMatch = lines[0].match(/^#\s+(.+)$/);
  const title = titleMatch ? titleMatch[1] : 'Untitled Section';
  
  const questions: Question[] = [];
  let currentQuestion: Question | null = null;
  let currentOptions: QuestionOption[] = [];
  
  // Parse each line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if it's a question (starts with a number followed by a dot)
    const questionMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (questionMatch) {
      // If we were working on a previous question, add it to the questions array
      if (currentQuestion) {
        currentQuestion.options = currentOptions;
        questions.push(currentQuestion);
        currentOptions = [];
      }
      
      // Create a new question
      currentQuestion = {
        id: uuidv4(),
        text: questionMatch[2],
        type: 'single', // Default, will be overridden later
        required: true,
        options: []
      };
      continue;
    }
    
    // Check if it's an option (starts with a dash)
    const optionMatch = line.match(/^-\s+(.+)$/);
    if (optionMatch && currentQuestion) {
      currentOptions.push({
        id: uuidv4(),
        text: optionMatch[1]
      });
      continue;
    }
    
    // Check if it's a question type indicator (starts with double dash)
    const typeMatch = line.match(/^--\s+(.+)$/);
    if (typeMatch && currentQuestion) {
      const typeText = typeMatch[1].toLowerCase();
      
      if (typeText.includes('single')) {
        currentQuestion.type = 'single';
      } else if (typeText.includes('multiple')) {
        currentQuestion.type = 'multiple';
      } else if (typeText.includes('text')) {
        currentQuestion.type = 'text';
      }
      
      // If the question is of type text, we don't need options
      if (currentQuestion.type === 'text') {
        currentOptions = [];
      }
    }
  }
  
  // Add the last question if there is one
  if (currentQuestion) {
    currentQuestion.options = currentOptions;
    questions.push(currentQuestion);
  }
  
  return {
    id: uuidv4(),
    title,
    questions
  };
}

/**
 * Creates a survey from a markdown file
 * @param filePath - Path to the markdown file
 * @param surveyTitle - Title for the survey
 * @param surveyDescription - Description for the survey
 */
async function createSurveyFromMarkdown(
  filePath: string, 
  surveyTitle: string,
  surveyDescription?: string
): Promise<void> {
  try {
    const section = parseMarkdownSection(filePath);
    
    const surveyData: SurveyData = {
      title: surveyTitle,
      description: surveyDescription,
      sections: [section]
    };
    
    // Create the survey in the database
    await Survey.create(surveyData);
    
    console.log(`Survey "${surveyTitle}" created successfully!`);
  } catch (error) {
    console.error('Error creating survey:', error);
  }
}

/**
 * Creates a multi-section survey from multiple markdown files that share a common prefix
 * @param directoryPath - Path to the directory containing markdown files
 * @param filePrefix - Common prefix for the files that should be combined into one survey
 * @param surveyTitle - Title for the survey
 * @param surveyDescription - Description for the survey
 */
async function createMultiSectionSurvey(
  directoryPath: string,
  filePrefix: string,
  surveyTitle: string,
  surveyDescription?: string
): Promise<void> {
  try {
    // Find all files that start with the given prefix
    const allFiles = fs.readdirSync(directoryPath)
      .filter(file => file.startsWith(filePrefix) && file.endsWith('.md'));
    
    if (allFiles.length === 0) {
      console.log(`No files found with prefix "${filePrefix}"`);
      return;
    }
    
    // Sort files to ensure consistent order
    allFiles.sort();
    
    console.log(`Found ${allFiles.length} files for multi-section survey "${surveyTitle}"`);
    
    // Parse each file as a section
    const sections: Section[] = [];
    
    for (const file of allFiles) {
      const filePath = path.join(directoryPath, file);
      const section = parseMarkdownSection(filePath);
      sections.push(section);
      console.log(`  - Added section "${section.title}" from ${file}`);
    }
    
    // Create the survey with all sections
    const surveyData: SurveyData = {
      title: surveyTitle,
      description: surveyDescription,
      sections
    };
    
    // Create the survey in the database
    await Survey.create(surveyData);
    
    console.log(`Multi-section survey "${surveyTitle}" created successfully with ${sections.length} sections!`);
  } catch (error) {
    console.error('Error creating multi-section survey:', error);
  }
}

/**
 * Seeds all surveys from markdown files in the specified directory.
 * Files with the same prefix (before an underscore) will be combined into a
 * multi-section survey.
 * @param directoryPath - Path to the directory containing markdown files
 */
async function seedSurveysFromDirectory(directoryPath: string): Promise<void> {
  try {
    // Make sure the directory exists
    if (!fs.existsSync(directoryPath)) {
      console.error(`Directory does not exist: ${directoryPath}`);
      return;
    }
    
    // Get all markdown files
    const files = fs.readdirSync(directoryPath)
      .filter(file => file.endsWith('.md') && file !== 'README.md');
    
    if (files.length === 0) {
      console.log('No markdown files found in the directory.');
      return;
    }
    
    console.log(`Found ${files.length} markdown files. Starting to seed surveys...`);
    
    // Connect to the database
    await connectDB();
    
    // Find file prefixes for multi-section surveys
    const prefixMap = new Map<string, string[]>();
    
    files.forEach(file => {
      // If the file has a part indicator (e.g., Customer_Experience_Part1.md)
      const partMatch = file.match(/^(.+?)_Part\d+\.md$/i);
      
      if (partMatch) {
        const prefix = partMatch[1];
        const filesForPrefix = prefixMap.get(prefix) || [];
        filesForPrefix.push(file);
        prefixMap.set(prefix, filesForPrefix);
      }
    });
    
    // Create multi-section surveys
    for (const [prefix, relatedFiles] of prefixMap.entries()) {
      if (relatedFiles.length > 1) {
        const surveyTitle = prefix.replace(/_/g, ' ');
        
        await createMultiSectionSurvey(
          directoryPath,
          prefix,
          surveyTitle,
          `Multi-section survey created from ${relatedFiles.length} files with prefix "${prefix}"`
        );
        
        // Remove these files from the list of individual files to process
        relatedFiles.forEach(file => {
          const index = files.indexOf(file);
          if (index !== -1) {
            files.splice(index, 1);
          }
        });
      }
    }
    
    // Process remaining individual files
    for (const file of files) {
      // Skip files that might be part of multi-section surveys
      if (/_Part\d+\.md$/i.test(file)) {
        continue;
      }
      
      const filePath = path.join(directoryPath, file);
      
      // Generate survey title from file name
      const surveyTitle = file
        .replace('.md', '')
        .replace(/_/g, ' ');
      
      await createSurveyFromMarkdown(
        filePath, 
        surveyTitle,
        `Survey created from ${file}`
      );
    }
    
    console.log('All surveys have been seeded successfully!');
  } catch (error) {
    console.error('Error seeding surveys:', error);
  }
}

// If this script is run directly (not imported)
if (require.main === module) {
  const markdownDir = path.join(__dirname, '../../markdown');
  
  seedSurveysFromDirectory(markdownDir)
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export {
  parseMarkdownSection,
  createSurveyFromMarkdown,
  createMultiSectionSurvey,
  seedSurveysFromDirectory
}; 