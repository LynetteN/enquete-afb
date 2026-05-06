import { pool } from './config';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  const client = await pool.connect();

  try {
    console.log('🔄 Starting database seeding...');

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
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run seeding
seedDatabase()
  .then(() => {
    console.log('✅ Seeding process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding process failed:', error);
    process.exit(1);
  });
