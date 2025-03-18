/*
<aicontext>
This file defines the SurveyResponse model using Sequelize ORM.
</aicontext>
*/

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './db';
import Survey from './survey.model';

interface ResponseAttributes {
  id: string;
  surveyId: string;
  email: string;
  name: string | null;
  responses: any; // JSON data
  createdAt?: Date;
  updatedAt?: Date;
}

interface ResponseCreationAttributes extends Optional<ResponseAttributes, 'id'> {}

/**
 * SurveyResponse model represents a user's response to a survey
 */
class SurveyResponse extends Model<ResponseAttributes, ResponseCreationAttributes> implements ResponseAttributes {
  public id!: string;
  public surveyId!: string;
  public email!: string;
  public name!: string | null;
  public responses!: any;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SurveyResponse.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  surveyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Survey,
      key: 'id'
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  responses: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'SurveyResponse',
  tableName: 'survey_responses',
  timestamps: true,
});

// Establish relationship
SurveyResponse.belongsTo(Survey, { foreignKey: 'surveyId', as: 'survey' });
Survey.hasMany(SurveyResponse, { foreignKey: 'surveyId', as: 'responses' });

export default SurveyResponse; 