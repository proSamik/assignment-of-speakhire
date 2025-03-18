/*
<aicontext>
This file sets up the Sequelize database connection and initializes models.
</aicontext>
*/

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/survey_app',
  {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  }
);

/**
 * Establish connection with the database
 * @returns Promise<void>
 */
export const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync all models with careful migration handling
    // In development mode, we allow table alterations
    // In production, we only create missing tables but don't alter existing ones
    // to prevent data loss
    const syncOptions = {
      alter: process.env.NODE_ENV === 'development',
      // Setting force to true would drop tables and recreate them - dangerous in production!
      force: false
    };
    
    await sequelize.sync(syncOptions);
    console.log('Database models synchronized with options:', JSON.stringify(syncOptions));
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

export default sequelize; 