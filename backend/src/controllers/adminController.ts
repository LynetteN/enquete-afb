import { Request, Response as ExpressResponse } from 'express';
import { pool } from '../database/config';
import { ApiResponse, AuthResponse, CreateAdminRequest, LoginRequest, Admin, AdminRow } from '../types';
import { generateToken } from '../middleware/auth';
import bcrypt from 'bcrypt';

type Response = ExpressResponse;

export const login = async (req: Request, res: ExpressResponse) => {
  try {
    const { username, password }: LoginRequest = req.body;

    const query = 'SELECT * FROM admins WHERE username = $1';
    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const adminRow = result.rows[0] as AdminRow;
    const isValidPassword = await bcrypt.compare(password, adminRow.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const admin: Omit<Admin, 'password'> = {
      id: adminRow.id,
      username: adminRow.username,
      name: adminRow.name,
      created_at: adminRow.created_at,
      updated_at: adminRow.updated_at
    };

    const token = generateToken(admin);

    const authResponse: AuthResponse = {
      token,
      admin
    };

    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: authResponse,
      message: 'Login successful'
    };

    res.json(response);
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
};

export const getAdmins = async (req: Request, res: ExpressResponse) => {
  try {
    const query = `
      SELECT id, username, name, created_at, updated_at
      FROM admins
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query);
    const adminRows = result.rows as AdminRow[];

    const admins: Omit<Admin, 'password'>[] = adminRows.map(row => ({
      id: row.id,
      username: row.username,
      name: row.name,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    const response: ApiResponse<Omit<Admin, 'password'>[]> = {
      success: true,
      data: admins
    };

    res.json(response);
  } catch (error) {
    console.error('Error getting admins:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get admins'
    });
  }
};

export const createAdmin = async (req: Request, res: ExpressResponse) => {
  try {
    const { username, password, name }: CreateAdminRequest = req.body;

    // Check if username already exists
    const checkQuery = 'SELECT id FROM admins WHERE username = $1';
    const checkResult = await pool.query(checkQuery, [username]);

    if (checkResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Username already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminId = `admin_${Date.now()}`;
    const now = new Date();

    const query = `
      INSERT INTO admins (id, username, password, name, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, username, name, created_at, updated_at
    `;

    const values = [adminId, username, hashedPassword, name, now, now];
    const result = await pool.query(query, values);

    const adminRow = result.rows[0] as AdminRow;
    const admin: Omit<Admin, 'password'> = {
      id: adminRow.id,
      username: adminRow.username,
      name: adminRow.name,
      created_at: adminRow.created_at,
      updated_at: adminRow.updated_at
    };

    const response: ApiResponse<Omit<Admin, 'password'>> = {
      success: true,
      data: admin,
      message: 'Admin created successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create admin'
    });
  }
};

export const deleteAdmin = async (req: Request, res: ExpressResponse) => {
  try {
    const { id } = req.params;

    // Prevent deleting the last admin
    const countQuery = 'SELECT COUNT(*) as count FROM admins';
    const countResult = await pool.query(countQuery);

    if (parseInt(countResult.rows[0].count) <= 1) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete the last admin account'
      });
    }

    const query = 'DELETE FROM admins WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }

    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete admin'
    });
  }
};

export const updateAdminPassword = async (req: Request, res: ExpressResponse) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const now = new Date();

    const query = `
      UPDATE admins
      SET password = $1, updated_at = $2
      WHERE id = $3
      RETURNING id, username, name, created_at, updated_at
    `;

    const result = await pool.query(query, [hashedPassword, now, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }

    const adminRow = result.rows[0] as AdminRow;
    const admin: Omit<Admin, 'password'> = {
      id: adminRow.id,
      username: adminRow.username,
      name: adminRow.name,
      created_at: adminRow.created_at,
      updated_at: adminRow.updated_at
    };

    const response: ApiResponse<Omit<Admin, 'password'>> = {
      success: true,
      data: admin,
      message: 'Password updated successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Error updating admin password:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update password'
    });
  }
};

export const getStats = async (req: Request, res: ExpressResponse) => {
  try {
    const surveysQuery = 'SELECT COUNT(*) as count FROM surveys';
    const responsesQuery = 'SELECT COUNT(*) as count FROM responses';
    const adminsQuery = 'SELECT COUNT(*) as count FROM admins';

    const [surveysResult, responsesResult, adminsResult] = await Promise.all([
      pool.query(surveysQuery),
      pool.query(responsesQuery),
      pool.query(adminsQuery)
    ]);

    const stats = {
      surveys: parseInt(surveysResult.rows[0].count),
      responses: parseInt(responsesResult.rows[0].count),
      admins: parseInt(adminsResult.rows[0].count)
    };

    const response: ApiResponse<typeof stats> = {
      success: true,
      data: stats
    };

    res.json(response);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics'
    });
  }
};