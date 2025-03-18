/**
 * This script migrates existing survey data to add required fields
 */

import { connectDB } from '../models/db';
import Survey from '../models/survey.model';
import sequelize from '../models/db';
import { QueryTypes } from 'sequelize';

/**
 * Checks if a column exists in the surveys table
 * @param columnName - Name of the column to check
 * @returns Promise<boolean> - True if the column exists
 */
async function columnExists(columnName: string): Promise<boolean> {
  try {
    const query = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'surveys' AND column_name = :columnName
    `;
    
    const result = await sequelize.query(query, {
      replacements: { columnName },
      type: QueryTypes.SELECT
    });
    
    return result.length > 0;
  } catch (error) {
    console.error(`Error checking if column ${columnName} exists:`, error);
    return false;
  }
}

/**
 * Adds a column to the surveys table with a default value if it doesn't exist
 * @param columnName - Name of the column to add
 * @param columnType - Type of the column (e.g., 'BOOLEAN', 'VARCHAR(255)')
 * @param defaultValue - Default value for the column
 */
async function addColumnIfNotExists(
  columnName: string, 
  columnType: string, 
  defaultValue: string
): Promise<void> {
  try {
    const exists = await columnExists(columnName);
    
    if (!exists) {
      console.log(`Column ${columnName} does not exist. Adding it...`);
      
      const query = `
        ALTER TABLE surveys 
        ADD COLUMN "${columnName}" ${columnType} 
        DEFAULT ${defaultValue} NOT NULL
      `;
      
      await sequelize.query(query);
      console.log(`Column ${columnName} added successfully.`);
    } else {
      console.log(`Column ${columnName} already exists.`);
    }
  } catch (error) {
    console.error(`Error adding column ${columnName}:`, error);
    throw error;
  }
}

/**
 * Updates all existing surveys to set sourceFile based on title
 */
async function updateExistingSurveys(): Promise<void> {
  try {
    console.log('Updating existing surveys...');
    
    // Get all surveys that have the migrated_existing_survey source file
    const surveys = await Survey.findAll({
      where: {
        sourceFile: 'migrated_existing_survey'
      }
    });
    
    console.log(`Found ${surveys.length} surveys to update.`);
    
    // Update each survey with a more descriptive sourceFile
    for (const survey of surveys) {
      const sanitizedTitle = survey.title.replace(/\s+/g, '_').toLowerCase();
      const sourceFile = `migrated_${sanitizedTitle}_${survey.id.substring(0, 8)}.md`;
      
      await survey.update({ sourceFile });
      console.log(`Updated survey "${survey.title}" with sourceFile: ${sourceFile}`);
    }
    
    console.log('Survey migration completed successfully.');
  } catch (error) {
    console.error('Error updating existing surveys:', error);
    throw error;
  }
}

/**
 * Runs the migration process
 */
export async function migrateSurveys(): Promise<void> {
  try {
    // Connect to the database
    await connectDB();
    
    // Add required columns if they don't exist
    await addColumnIfNotExists('isActive', 'BOOLEAN', 'true');
    await addColumnIfNotExists('sourceFile', 'VARCHAR(255)', '\'migrated_existing_survey\'');
    
    // Update existing surveys
    await updateExistingSurveys();
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}

// If this script is run directly (not imported), execute the migration
if (require.main === module) {
  migrateSurveys()
    .then(() => {
      console.log('Migration script finished successfully.');
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
} 