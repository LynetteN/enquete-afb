import { Request, Response as ExpressResponse } from 'express';
import { pool } from '../database/config';
import { ApiResponse, CreateResponseRequest, SurveyResponse, ResponseRow } from '../types';

export const createResponse = async (req: Request, res: ExpressResponse) => {
  try {
    const { survey_id, answers, session_token, is_admin }: CreateResponseRequest = req.body;

    // Check if user has already responded (only for regular users)
    if (!is_admin) {
      const checkQuery = `
        SELECT id FROM responses
        WHERE survey_id = $1 AND session_token = $2
      `;

      const checkResult = await pool.query(checkQuery, [survey_id, session_token]);

      if (checkResult.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'User has already responded to this survey'
        });
      }
    }

    const timestamp = new Date();
    const syncedAt = new Date();

    const query = `
      INSERT INTO responses (survey_id, session_token, answers, timestamp, is_admin, synced_at, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      survey_id,
      session_token,
      JSON.stringify(answers),
      timestamp,
      is_admin || false,
      syncedAt,
      timestamp
    ];

    const result = await pool.query(query, values);
    const responseRow = result.rows[0] as ResponseRow;

    const response: SurveyResponse = {
      id: responseRow.id,
      survey_id: responseRow.survey_id,
      session_token: responseRow.session_token,
      answers: typeof responseRow.answers === 'string' ? JSON.parse(responseRow.answers) : responseRow.answers,
      timestamp: responseRow.timestamp,
      is_admin: responseRow.is_admin,
      synced_at: responseRow.synced_at,
      created_at: responseRow.created_at
    };

    const apiResponse: ApiResponse<SurveyResponse> = {
      success: true,
      data: response,
      message: 'Response submitted successfully'
    };

    res.status(201).json(apiResponse);
  } catch (error) {
    console.error('Error creating response:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit response'
    });
  }
};

export const getResponses = async (req: Request, res: ExpressResponse) => {
  try {
    const query = `
      SELECT * FROM responses
      ORDER BY timestamp DESC
    `;

    const result = await pool.query(query);
    const responseRows = result.rows as ResponseRow[];

    const responses: SurveyResponse[] = responseRows.map(row => ({
      id: row.id,
      survey_id: row.survey_id,
      session_token: row.session_token,
      answers: typeof row.answers === 'string' ? JSON.parse(row.answers) : row.answers,
      timestamp: row.timestamp,
      is_admin: row.is_admin,
      synced_at: row.synced_at,
      created_at: row.created_at
    }));

    const apiResponse: ApiResponse<SurveyResponse[]> = {
      success: true,
      data: responses
    };

    res.json(apiResponse);
  } catch (error) {
    console.error('Error getting responses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get responses'
    });
  }
};

export const getResponsesBySurvey = async (req: Request, res: ExpressResponse) => {
  try {
    const { surveyId } = req.params;

    const query = `
      SELECT * FROM responses
      WHERE survey_id = $1
      ORDER BY timestamp DESC
    `;

    const result = await pool.query(query, [surveyId]);
    const responseRows = result.rows as ResponseRow[];

    const responses: SurveyResponse[] = responseRows.map(row => ({
      id: row.id,
      survey_id: row.survey_id,
      session_token: row.session_token,
      answers: typeof row.answers === 'string' ? JSON.parse(row.answers) : row.answers,
      timestamp: row.timestamp,
      is_admin: row.is_admin,
      synced_at: row.synced_at,
      created_at: row.created_at
    }));

    const apiResponse: ApiResponse<SurveyResponse[]> = {
      success: true,
      data: responses
    };

    res.json(apiResponse);
  } catch (error) {
    console.error('Error getting survey responses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get survey responses'
    });
  }
};

export const getResponseById = async (req: Request, res: ExpressResponse) => {
  try {
    const { id } = req.params;

    const query = 'SELECT * FROM responses WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Response not found'
      });
    }

    const responseRow = result.rows[0] as ResponseRow;
    const response: SurveyResponse = {
      id: responseRow.id,
      survey_id: responseRow.survey_id,
      session_token: responseRow.session_token,
      answers: typeof responseRow.answers === 'string' ? JSON.parse(responseRow.answers) : responseRow.answers,
      timestamp: responseRow.timestamp,
      is_admin: responseRow.is_admin,
      synced_at: responseRow.synced_at,
      created_at: responseRow.created_at
    };

    const apiResponse: ApiResponse<SurveyResponse> = {
      success: true,
      data: response
    };

    res.json(apiResponse);
  } catch (error) {
    console.error('Error getting response:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get response'
    });
  }
};

export const hasUserResponded = async (req: Request, res: ExpressResponse) => {
  try {
    const { surveyId } = req.params;
    const { session_token } = req.query;

    if (!session_token) {
      return res.status(400).json({
        success: false,
        error: 'Session token is required'
      });
    }

    const query = `
      SELECT id FROM responses
      WHERE survey_id = $1 AND session_token = $2
    `;

    const result = await pool.query(query, [surveyId, session_token]);

    const hasResponded = result.rows.length > 0;

    res.json({
      success: true,
      data: { hasResponded }
    });
  } catch (error) {
    console.error('Error checking user response:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check user response'
    });
  }
};

export const deleteResponse = async (req: Request, res: ExpressResponse) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM responses WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Response not found'
      });
    }

    res.json({
      success: true,
      message: 'Response deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting response:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete response'
    });
  }
};