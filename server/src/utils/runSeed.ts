/**
 * This script runs the seed process to create surveys from markdown files
 */

import path from 'path';
import { seedSurveysFromDirectory } from './seedSurveys';

const markdownDir = path.join(__dirname, '../../markdown');

console.log('Starting to seed surveys from markdown files...');
console.log(`Looking for markdown files in: ${markdownDir}`);

seedSurveysFromDirectory(markdownDir)
  .then(() => {
    console.log('Seed completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error during seed process:', error);
    process.exit(1);
  }); 