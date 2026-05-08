import { Request, Response } from 'express';
import { pool } from '../database/config';

export const runMigration = async (req: Request, res: Response) => {
  try {
    console.log('🔄 Running database migration...');

    const client = await pool.connect();

    try {
      // Create admins table
      await client.query(`
        CREATE TABLE IF NOT EXISTS admins (
          id VARCHAR(255) PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Created admins table');

      // Create surveys table
      await client.query(`
        CREATE TABLE IF NOT EXISTS surveys (
          id SERIAL PRIMARY KEY,
          title VARCHAR(500) NOT NULL,
          description TEXT,
          questions JSONB NOT NULL,
          categories JSONB,
          version VARCHAR(100),
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_by VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          published_at TIMESTAMP
        )
      `);
      console.log('✅ Created surveys table');

      // Create responses table
      await client.query(`
        CREATE TABLE IF NOT EXISTS responses (
          id SERIAL PRIMARY KEY,
          survey_id VARCHAR(500) NOT NULL,
          session_token VARCHAR(500) NOT NULL,
          answers JSONB NOT NULL,
          timestamp TIMESTAMP NOT NULL,
          is_admin BOOLEAN DEFAULT FALSE,
          synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Created responses table');

      // Create indexes
      await client.query(`CREATE INDEX IF NOT EXISTS idx_responses_survey_id ON responses(survey_id)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_responses_session_token ON responses(session_token)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_responses_timestamp ON responses(timestamp)`);
      console.log('✅ Created indexes');

      // Create trigger function
      await client.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ language plpgsql
      `);

      // Create trigger for admins table
      await client.query(`DROP TRIGGER IF EXISTS update_admins_updated_at ON admins`);
      await client.query(`
        CREATE TRIGGER update_admins_updated_at
          BEFORE UPDATE ON admins
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column()
      `);
      console.log('✅ Created triggers');

      console.log('🎉 Database migration completed successfully!');

      res.json({
        success: true,
        message: 'Database migration completed successfully',
        tables: ['admins', 'surveys', 'responses'],
        indexes: ['idx_responses_survey_id', 'idx_responses_session_token', 'idx_responses_timestamp'],
        triggers: ['update_admins_updated_at']
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    res.status(500).json({
      success: false,
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const runSeed = async (req: Request, res: Response) => {
  try {
    console.log('🔄 Starting database seeding...');

    const client = await pool.connect();
    const bcrypt = require('bcryptjs');

    try {
      // Check if default admin exists
      const adminCheck = await client.query(
        'SELECT COUNT(*) FROM admins WHERE username = $1',
        ['admin']
      );

      if (parseInt(adminCheck.rows[0].count) === 0) {
        // Create default admin
        const hashedPassword = await bcrypt.hash('afriland2026', 10);

        await client.query(
          `INSERT INTO admins (id, username, password, name)
           VALUES ($1, $2, $3, $4)`,
          ['admin_1', 'admin', hashedPassword, 'Administrateur Principal']
        );
        console.log('✅ Created default admin account');
        console.log('   Username: admin');
        console.log('   Password: afriland2026');
      } else {
        console.log('ℹ️  Default admin already exists');
      }

      // Check if sample survey exists
      const surveyCheck = await client.query('SELECT COUNT(*) FROM surveys');

      if (parseInt(surveyCheck.rows[0].count) === 0) {
        // Create sample survey
        const sampleSurvey = {
          title: "Baromètre Engagement Collaborateur",
          description: "Votre avis est essentiel pour façonner l'excellence chez Afriland First Bank.",
          questions: [
            {
              id: 1,
              text: "Comment évaluez-vous votre équilibre vie pro / vie perso chez Afriland ?",
              type: 'rating',
              required: true,
              category: "Équilibre Vie Pro/Perso"
            },
            {
              id: 2,
              text: "Les objectifs fixés par votre management sont-ils clairs et atteignables ?",
              type: 'choice',
              required: true,
              category: "Management & Leadership",
              options: ["Tout à fait", "Plutôt oui", "Plutôt non", "Pas du tout"]
            },
            {
              id: 3,
              text: "Si vous deviez changer une seule chose pour améliorer votre quotidien, laquelle serait-elle ?",
              type: 'text',
              required: false,
              category: "Environnement de Travail"
            }
          ],
          categories: ["Équilibre Vie Pro/Perso", "Management & Leadership", "Environnement de Travail"],
          version: "1.0.0"
        };

        await client.query(
          `INSERT INTO surveys (title, description, questions, categories, version, updated_by)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            sampleSurvey.title,
            sampleSurvey.description,
            JSON.stringify(sampleSurvey.questions),
            JSON.stringify(sampleSurvey.categories),
            sampleSurvey.version,
            'system'
          ]
        );
        console.log('✅ Created sample survey');
      } else {
        console.log('ℹ️  Sample survey already exists');
      }

      console.log('🎉 Database seeding completed successfully!');

      res.json({
        success: true,
        message: 'Database seeding completed successfully',
        admin: {
          username: 'admin',
          password: 'afriland2026',
          note: 'Please change this password immediately after first login'
        },
        survey: {
          title: "Baromètre Engagement Collaborateur",
          questions_count: 3
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    res.status(500).json({
      success: false,
      error: 'Seeding failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};