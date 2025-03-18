/**
 * This script parses markdown files and creates surveys in the database
 */

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { connectDB } from '../models/db';
import Survey from '../models/survey.model';
import crypto from 'crypto';

interface QuestionOption {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  type: 'single' | 'multiple' | 'text' | 'range';
  required: boolean;
  options?: QuestionOption[];
  rangeMin?: number;
  rangeMax?: number;
  rangeLabels?: {
    min: string;
    max: string;
  };
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
  isActive: boolean;
  sourceFile: string;
  fileHash: string;
}

/**
 * Calculates MD5 hash of a file to track changes
 * @param filePath - Path to the file
 * @returns MD5 hash string
 */
function getFileHash(filePath: string): string {
  const fileContent = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(fileContent).digest('hex');
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
      // Check if it's a range option (contains arrow →)
      const rangeMatch = optionMatch[1].match(/(\d+)\s*\(([^)]+)\)\s*→\s*(\d+)\s*\(([^)]+)\)/);
      if (rangeMatch && currentQuestion) {
        // It's a range option
        const min = parseInt(rangeMatch[1], 10);
        const minLabel = rangeMatch[2].trim();
        const max = parseInt(rangeMatch[3], 10);
        const maxLabel = rangeMatch[4].trim();
        
        // Store range info in the question
        currentQuestion.type = 'range';
        currentQuestion.rangeMin = min;
        currentQuestion.rangeMax = max;
        currentQuestion.rangeLabels = {
          min: minLabel,
          max: maxLabel
        };
        
        // We don't need to store options for range questions
        currentOptions = [];
      } else {
        // Regular option
        currentOptions.push({
          id: uuidv4(),
          text: optionMatch[1]
        });
      }
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
      } else if (typeText.includes('range')) {
        currentQuestion.type = 'range';
      }
      
      // If the question is of type text or range, we don't need options
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
 * @param sourceFileName - Name of the source markdown file
 */
async function createSurveyFromMarkdown(
  filePath: string, 
  surveyTitle: string,
  surveyDescription: string | undefined,
  sourceFileName: string | undefined
): Promise<void> {
  try {
    const section = parseMarkdownSection(filePath);
    
    // Calculate file hash to track changes
    const fileHash = getFileHash(filePath);
    
    const surveyData: SurveyData = {
      title: surveyTitle,
      description: surveyDescription,
      sections: [section],
      isActive: true,
      sourceFile: sourceFileName || path.basename(filePath),
      fileHash: fileHash // Store the file hash
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
 * @param sourceFiles - Array of source file names
 */
async function createMultiSectionSurvey(
  directoryPath: string,
  filePrefix: string,
  surveyTitle: string,
  surveyDescription: string | undefined,
  sourceFiles: string[] | undefined
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
    
    // Generate a combined hash of all files
    let combinedHash = '';
    
    for (const file of allFiles) {
      const filePath = path.join(directoryPath, file);
      const section = parseMarkdownSection(filePath);
      sections.push(section);
      console.log(`  - Added section "${section.title}" from ${file}`);
      
      // Add this file's hash to the combined hash
      combinedHash += getFileHash(filePath);
    }
    
    // Create a hash of the combined hash to get a single hash
    const finalHash = crypto.createHash('md5').update(combinedHash).digest('hex');
    
    // Create the survey with all sections
    const surveyData: SurveyData = {
      title: surveyTitle,
      description: surveyDescription,
      sections,
      isActive: true,
      sourceFile: sourceFiles ? sourceFiles.join(',') : allFiles.join(','),
      fileHash: finalHash // Store the combined hash
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
    
    // First, get all existing surveys from database to track changes
    const existingSurveys = await Survey.findAll({
      attributes: ['id', 'title', 'sourceFile', 'isActive', 'fileHash']
    });
    
    // Create a map of sourceFile to survey
    const existingSurveyMap = new Map();
    existingSurveys.forEach(survey => {
      // For multi-section surveys, the sourceFile will contain multiple filenames separated by commas
      const sourceFiles = survey.sourceFile.split(',');
      sourceFiles.forEach(file => {
        existingSurveyMap.set(file.trim(), {
          id: survey.id,
          title: survey.title,
          isActive: survey.isActive,
          fileHash: survey.fileHash
        });
      });
    });
    
    // Store file hashes to track changes
    const fileHashes = new Map<string, string>();
    files.forEach(file => {
      const filePath = path.join(directoryPath, file);
      fileHashes.set(file, getFileHash(filePath));
    });
    
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
    
    // Track which files have been processed
    const processedFiles = new Set<string>();
    
    // Create multi-section surveys
    for (const [prefix, relatedFiles] of prefixMap.entries()) {
      if (relatedFiles.length > 1) {
        // Mark these files as processed
        relatedFiles.forEach(file => processedFiles.add(file));
        
        // Get survey title from prefix (replace underscores with spaces)
        const surveyTitle = prefix.replace(/_/g, ' ');
        
        // Check if all the related files exist in our map and have the same survey ID
        const existingRelatedSurveys = relatedFiles.map(file => existingSurveyMap.get(file));
        const allExist = existingRelatedSurveys.every(Boolean);
        
        if (allExist) {
          // Check if all related files belong to same survey (have same ID)
          const surveyIds = new Set(existingRelatedSurveys.map(survey => survey.id));
          
          if (surveyIds.size === 1) {
            // All related files belong to same survey
            const surveyId = existingRelatedSurveys[0].id;
            
            // Generate a combined hash of all files
            let combinedHash = '';
            for (const file of relatedFiles) {
              const filePath = path.join(directoryPath, file);
              combinedHash += getFileHash(filePath);
            }
            const finalHash = crypto.createHash('md5').update(combinedHash).digest('hex');
            
            // Check if the combined hash has changed
            if (existingRelatedSurveys[0].fileHash !== finalHash) {
              // Mark existing survey as inactive (old version)
              await Survey.update({ isActive: false }, { where: { id: surveyId } });
              console.log(`Multi-section survey "${surveyTitle}" has changed. Creating new version...`);
              
              // Create new survey
              await createMultiSectionSurvey(directoryPath, prefix, surveyTitle, undefined, relatedFiles);
            } else {
              console.log(`No changes detected for multi-section survey "${surveyTitle}". Skipping...`);
            }
          } else {
            // Files belong to different surveys - consolidate them
            console.log(`Files for "${surveyTitle}" belong to different surveys. Consolidating...`);
            
            // Mark all related surveys as inactive
            for (const survey of existingRelatedSurveys) {
              await Survey.update({ isActive: false }, { where: { id: survey.id } });
            }
            
            // Create new consolidated survey
            await createMultiSectionSurvey(directoryPath, prefix, surveyTitle, undefined, relatedFiles);
          }
        } else {
          // New multi-section survey or some files are new
          console.log(`Creating new multi-section survey "${surveyTitle}"...`);
          await createMultiSectionSurvey(directoryPath, prefix, surveyTitle, undefined, relatedFiles);
        }
      }
    }
    
    // Create individual surveys for files that aren't part of multi-section surveys
    for (const file of files) {
      if (!processedFiles.has(file)) {
        const filePath = path.join(directoryPath, file);
        
        // Extract survey title from filename (remove extension and replace underscores with spaces)
        const surveyTitle = file.replace('.md', '').replace(/_/g, ' ');
        
        // Check if this survey already exists
        const existingSurvey = existingSurveyMap.get(file);
        
        if (existingSurvey) {
          // Check if the file has changed
          const currentHash = fileHashes.get(file);
          
          if (existingSurvey.fileHash !== currentHash) {
            // Mark existing survey as inactive
            await Survey.update({ isActive: false }, { where: { id: existingSurvey.id } });
            console.log(`Survey "${surveyTitle}" has changed. Creating new version...`);
            
            // Create new survey
            await createSurveyFromMarkdown(filePath, surveyTitle, undefined, file);
          } else {
            console.log(`No changes detected for survey "${surveyTitle}". Skipping...`);
          }
        } else {
          // New survey
          console.log(`Creating new survey "${surveyTitle}"...`);
          await createSurveyFromMarkdown(filePath, surveyTitle, undefined, file);
        }
      }
    }
    
    // Check for deleted files
    for (const [sourceFile, survey] of existingSurveyMap.entries()) {
      if (!files.includes(sourceFile) && survey.isActive) {
        // Mark as inactive if the file no longer exists
        await Survey.update({ isActive: false }, { where: { id: survey.id } });
        console.log(`Survey source file "${sourceFile}" no longer exists. Marked as inactive.`);
      }
    }
    
    console.log('Survey seed process completed!');
  } catch (error) {
    console.error('Error seeding surveys:', error);
    throw error;
  }
}

// Export the functions
export { seedSurveysFromDirectory }; 