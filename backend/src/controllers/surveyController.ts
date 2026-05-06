import { Request, Response as ExpressResponse } from 'express';
import { pool } from '../database/config';
import { ApiResponse, CreateSurveyRequest, Survey, SurveyRow } from '../types';

type Response = ExpressResponse;

export const createSurvey = async (req: Request, res: ExpressResponse) => {
  try {
    const { title, description, questions, categories }: CreateSurveyRequest = req.body;
    const adminId = (req as any).admin?.id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const version = Date.now().toString();
    const lastUpdated = new Date();

    const query = `
      INSERT INTO surveys (title, description, questions, categories, version, last_updated, updated_by, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      title,
      description,
      JSON.stringify(questions),
      JSON.stringify(categories),
      version,
      lastUpdated,
      adminId,
      lastUpdated
    ];

    const result = await pool.query(query, values);
    const surveyRow = result.rows[0] as SurveyRow;

    const survey: Survey = {
      id: surveyRow.id,
      title: surveyRow.title,
      description: surveyRow.description,
      questions: JSON.parse(surveyRow.questions),
      categories: JSON.parse(surveyRow.categories),
      version: surveyRow.version,
      last_updated: surveyRow.last_updated,
      updated_by: surveyRow.updated_by,
      created_at: surveyRow.created_at,
      published_at: surveyRow.published_at || undefined
    };

    const response: ApiResponse<Survey> = {
      success: true,
      data: survey,
      message: 'Survey created successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating survey:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create survey'
    });
  }
};

export const getSurveys = async (req: Request, res: ExpressResponse) => {
  try {
    const query = `
      SELECT * FROM surveys
      ORDER BY last_updated DESC
    `;

    const result = await pool.query(query);
    const surveyRows = result.rows as SurveyRow[];

    const surveys: Survey[] = surveyRows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      questions: JSON.parse(row.questions),
      categories: JSON.parse(row.categories),
      version: row.version,
      last_updated: row.last_updated,
      updated_by: row.updated_by,
      created_at: row.created_at,
      published_at: row.published_at || undefined
    }));

    const response: ApiResponse<Survey[]> = {
      success: true,
      data: surveys
    };

    res.json(response);
  } catch (error) {
    console.error('Error getting surveys:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get surveys'
    });
  }
};

export const getSurveyById = async (req: Request, res: ExpressResponse) => {
  try {
    const { id } = req.params;

    const query = 'SELECT * FROM surveys WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Survey not found'
      });
    }

    const surveyRow = result.rows[0] as SurveyRow;
    const survey: Survey = {
      id: surveyRow.id,
      title: surveyRow.title,
      description: surveyRow.description,
      questions: JSON.parse(surveyRow.questions),
      categories: JSON.parse(surveyRow.categories),
      version: surveyRow.version,
      last_updated: surveyRow.last_updated,
      updated_by: surveyRow.updated_by,
      created_at: surveyRow.created_at,
      published_at: surveyRow.published_at || undefined
    };

    const response: ApiResponse<Survey> = {
      success: true,
      data: survey
    };

    res.json(response);
  } catch (error) {
    console.error('Error getting survey:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get survey'
    });
  }
};

export const getLatestSurvey = async (req: Request, res: ExpressResponse) => {
  try {
    const query = `
      SELECT * FROM surveys
      ORDER BY last_updated DESC
      LIMIT 1
    `;

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No surveys found'
      });
    }

    const surveyRow = result.rows[0] as SurveyRow;
    const survey: Survey = {
      id: surveyRow.id,
      title: surveyRow.title,
      description: surveyRow.description,
      questions: JSON.parse(surveyRow.questions),
      categories: JSON.parse(surveyRow.categories),
      version: surveyRow.version,
      last_updated: surveyRow.last_updated,
      updated_by: surveyRow.updated_by,
      created_at: surveyRow.created_at,
      published_at: surveyRow.published_at || undefined
    };

    const response: ApiResponse<Survey> = {
      success: true,
      data: survey
    };

    res.json(response);
  } catch (error) {
    console.error('Error getting latest survey:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get latest survey'
    });
  }
};

export const updateSurvey = async (req: Request, res: ExpressResponse) => {
  try {
    const { id } = req.params;
    const { title, description, questions, categories }: CreateSurveyRequest = req.body;
    const adminId = (req as any).admin?.id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const version = Date.now().toString();
    const lastUpdated = new Date();

    const query = `
      UPDATE surveys
      SET title = $1, description = $2, questions = $3, categories = $4,
          version = $5, last_updated = $6, updated_by = $7
      WHERE id = $8
      RETURNING *
    `;

    const values = [
      title,
      description,
      JSON.stringify(questions),
      JSON.stringify(categories),
      version,
      lastUpdated,
      adminId,
      id
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Survey not found'
      });
    }

    const surveyRow = result.rows[0] as SurveyRow;
    const survey: Survey = {
      id: surveyRow.id,
      title: surveyRow.title,
      description: surveyRow.description,
      questions: JSON.parse(surveyRow.questions),
      categories: JSON.parse(surveyRow.categories),
      version: surveyRow.version,
      last_updated: surveyRow.last_updated,
      updated_by: surveyRow.updated_by,
      created_at: surveyRow.created_at,
      published_at: surveyRow.published_at || undefined
    };

    const response: ApiResponse<Survey> = {
      success: true,
      data: survey,
      message: 'Survey updated successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Error updating survey:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update survey'
    });
  }
};

export const deleteSurvey = async (req: Request, res: ExpressResponse) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM surveys WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Survey not found'
      });
    }

    res.json({
      success: true,
      message: 'Survey deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting survey:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete survey'
    });
  }
};