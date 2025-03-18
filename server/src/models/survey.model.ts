/*
<aicontext>
This file defines the Survey model using Sequelize ORM.
</aicontext>
*/

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './db';

interface SurveyAttributes {
  id: string;
  title: string;
  description: string | null;
  sections: any; // JSON data
  isActive: boolean;
  sourceFile: string;
  fileHash: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SurveyCreationAttributes extends Optional<SurveyAttributes, 'id'> {}

/**
 * Survey model represents a survey with sections and questions
 */
class Survey extends Model<SurveyAttributes, SurveyCreationAttributes> implements SurveyAttributes {
  public id!: string;
  public title!: string;
  public description!: string | null;
  public sections!: any;
  public isActive!: boolean;
  public sourceFile!: string;
  public fileHash!: string | null;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Survey.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  sections: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  sourceFile: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'migrated_existing_survey'
  },
  fileHash: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Survey',
  tableName: 'surveys',
  timestamps: true,
});

export default Survey; 