/**
 * This script runs the seed process to create surveys from markdown files
 */

import path from 'path';
import { seedSurveysFromDirectory } from './seedSurveys';
import { migrateSurveys } from './migrateSurveys';

/**
 * Runs the seed process to create and update surveys from markdown files
 * This should be called when the server starts to ensure surveys are up-to-date
 */
export async function runSeed(): Promise<void> {
  const markdownDir = path.join(__dirname, '../../markdown');

  console.log('Starting migration and seed process...');
  
  try {
    // First, run the migration to ensure database is properly set up
    await migrateSurveys();
    
    // Then seed surveys from markdown files
    console.log('\nStarting to seed surveys from markdown files...');
    console.log(`Looking for markdown files in: ${markdownDir}`);
    await seedSurveysFromDirectory(markdownDir);
    
    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error during seed process:', error);
    throw error;
  }
}

// If this script is run directly (not imported), execute the seed process
if (require.main === module) {
  runSeed()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('Error during seed process:', error);
      process.exit(1);
    });
} 