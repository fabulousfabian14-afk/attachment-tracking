const pool = require('./db');
const bcrypt = require('bcryptjs');

const createTables = async () => {
  const queries = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      reg_no VARCHAR(50) UNIQUE,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      course VARCHAR(255),
      department VARCHAR(255),
      year_of_study INT,
      phone VARCHAR(20),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Companies table
    `CREATE TABLE IF NOT EXISTS companies (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      location VARCHAR(255),
      contact_person VARCHAR(255),
      contact_phone VARCHAR(20),
      contact_email VARCHAR(255),
      industry VARCHAR(255),
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Attachments table
    `CREATE TABLE IF NOT EXISTS attachments (
      id SERIAL PRIMARY KEY,
      student_id INT NOT NULL REFERENCES users(id),
      company_id INT NOT NULL REFERENCES companies(id),
      supervisor_id INT REFERENCES users(id),
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      approved_by INT REFERENCES users(id),
      approved_date TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Logbooks table
    `CREATE TABLE IF NOT EXISTS logbooks (
      id SERIAL PRIMARY KEY,
      attachment_id INT NOT NULL REFERENCES attachments(id),
      week_number INT NOT NULL,
      activities TEXT,
      skills_learned TEXT,
      challenges TEXT,
      mood_rating INT,
      status VARCHAR(50) DEFAULT 'pending',
      approved_by INT REFERENCES users(id),
      comments TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Evaluations table
    `CREATE TABLE IF NOT EXISTS evaluations (
      id SERIAL PRIMARY KEY,
      attachment_id INT NOT NULL REFERENCES attachments(id),
      evaluator_id INT NOT NULL REFERENCES users(id),
      score INT,
      professionalism INT,
      technical_skills INT,
      communication INT,
      punctuality INT,
      teamwork INT,
      comments TEXT,
      evaluation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Reports table
    `CREATE TABLE IF NOT EXISTS reports (
      id SERIAL PRIMARY KEY,
      attachment_id INT NOT NULL REFERENCES attachments(id),
      file_path VARCHAR(255),
      submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(50) DEFAULT 'pending',
      grade VARCHAR(10),
      feedback TEXT,
      graded_by INT REFERENCES users(id),
      graded_date TIMESTAMP
    )`,

    // Visits table (for lecturer monitoring)
    `CREATE TABLE IF NOT EXISTS visits (
      id SERIAL PRIMARY KEY,
      attachment_id INT NOT NULL REFERENCES attachments(id),
      lecturer_id INT NOT NULL REFERENCES users(id),
      visit_date TIMESTAMP NOT NULL,
      observations TEXT,
      student_progress VARCHAR(50),
      supervisor_feedback TEXT
    )`,

    // Notifications table
    `CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id),
      title VARCHAR(255),
      message TEXT,
      type VARCHAR(50),
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  try {
    for (const query of queries) {
      await pool.query(query);
      console.log('Table created successfully');
    }
    console.log('All tables created successfully');
    
    // Seed demo users
    await seedDemoUsers();
    process.exit(0);
  } catch (err) {
    console.error('Error creating tables:', err);
    process.exit(1);
  }
};

const seedDemoUsers = async () => {
  try {
    const demoUsers = [
      { email: 'admin@university.com', password: 'password123', name: 'Admin User', role: 'admin' },
      { email: 'student@example.com', password: 'password123', name: 'Student User', role: 'student' },
      { email: 'supervisor@company.com', password: 'password123', name: 'Supervisor User', role: 'supervisor' },
      { email: 'lecturer@university.com', password: 'password123', name: 'Lecturer User', role: 'lecturer' }
    ];

    for (const user of demoUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await pool.query(
        'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
        [user.email, hashedPassword, user.name, user.role]
      );
      console.log(`Demo user created: ${user.email}`);
    }
    
    console.log('Demo users seeded successfully');
  } catch (err) {
    console.error('Error seeding demo users:', err);
    throw err;
  }
};

createTables();
