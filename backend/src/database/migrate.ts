import { pool } from './config';

const createTables = async () => {
  const client = await pool.connect();

  try {
    console.log('🔄 Starting database migration...');

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

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_responses_survey_id ON responses(survey_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_responses_session_token ON responses(session_token)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_responses_timestamp ON responses(timestamp)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_responses_survey_session ON responses(survey_id, session_token)
    `);
    console.log('✅ Created indexes');

    // Create function to update updated_at timestamp
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
    await client.query(`
      DROP TRIGGER IF EXISTS update_admins_updated_at ON admins
    `);
    await client.query(`
      CREATE TRIGGER update_admins_updated_at
        BEFORE UPDATE ON admins
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);

    console.log('✅ Created triggers');

    console.log('🎉 Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run migration
createTables()
  .then(() => {
    console.log('✅ Migration process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration process failed:', error);
    process.exit(1);
  });
