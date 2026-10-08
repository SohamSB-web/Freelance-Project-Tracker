const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const dbPath = path.join(__dirname, 'freelance_tracker.db');
const db = new DatabaseSync(dbPath);

// Initialize SQLite Schema (Strictly 3 Models: users, clients, projects)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE NOT NULL,
    name TEXT DEFAULT 'Freelancer',
    title TEXT DEFAULT 'Full-Stack Developer',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    company TEXT DEFAULT '',
    email TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    client_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT 'Web Development',
    budget REAL DEFAULT 0,
    status TEXT DEFAULT 'In Progress',
    deadline TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
  );
`);

// ==========================================
// DB HELPER FUNCTIONS FOR 3 MODELS
// ==========================================

// --- USER OPERATIONS ---
function getUserByPhone(phone) {
  const stmt = db.prepare('SELECT * FROM users WHERE phone = ?');
  return stmt.get(phone);
}

function getUserById(id) {
  const stmt = db.prepare('SELECT id, phone, name, title, created_at FROM users WHERE id = ?');
  return stmt.get(id);
}

function createUser(phone, name, title) {
  const stmt = db.prepare('INSERT INTO users (phone, name, title) VALUES (?, ?, ?)');
  const info = stmt.run(phone, name || 'Freelancer', title || 'Full-Stack Developer');
  const user = getUserById(Number(info.lastInsertRowid));

  // Auto-seed sample clients & projects for workshop showcase
  seedUserInitialData(user.id);
  return user;
}

// Seed realistic sample starter data for new freelancers
function seedUserInitialData(userId) {
  try {
    const client1Stmt = db.prepare('INSERT INTO clients (user_id, name, company, email) VALUES (?, ?, ?, ?)');
    const c1 = client1Stmt.run(userId, 'Sarah Jenkins', 'Apex Dynamics', 'sarah@apexdynamics.io');
    const c2 = client1Stmt.run(userId, 'David Miller', 'Solace Brand Studio', 'david@solacestudio.co');

    const projStmt = db.prepare(`
      INSERT INTO projects (user_id, client_id, title, description, category, budget, status, deadline)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    projStmt.run(
      userId,
      Number(c1.lastInsertRowid),
      'SaaS Analytics Dashboard',
      'Redesigning customer analytics view with real-time charts and export features.',
      'Web Development',
      3200,
      'In Progress',
      '2026-10-25'
    );

    projStmt.run(
      userId,
      Number(c2.lastInsertRowid),
      'E-Commerce Checkout Flow',
      'Optimizing multi-step checkout with Stripe integration and cart recovery.',
      'UI/UX Design',
      1800,
      'Planning',
      '2026-11-05'
    );

    projStmt.run(
      userId,
      Number(c1.lastInsertRowid),
      'REST API Migration',
      'Migrated legacy endpoints to Node.js microservices with JWT auth.',
      'Backend API',
      2400,
      'Completed',
      '2026-10-02'
    );
  } catch (err) {
    console.error('Error seeding starter data:', err);
  }
}

// --- CLIENT OPERATIONS ---
function getClientsByUserId(userId) {
  const stmt = db.prepare('SELECT * FROM clients WHERE user_id = ? ORDER BY name ASC');
  return stmt.all(userId);
}

function createClient(userId, name, company, email) {
  const stmt = db.prepare('INSERT INTO clients (user_id, name, company, email) VALUES (?, ?, ?, ?)');
  const info = stmt.run(userId, name, company || '', email || '');
  return {
    id: Number(info.lastInsertRowid),
    user_id: userId,
    name,
    company: company || '',
    email: email || ''
  };
}

// --- PROJECT OPERATIONS ---
function getProjectsByUserId(userId) {
  const stmt = db.prepare(`
    SELECT 
      p.id,
      p.user_id,
      p.client_id,
      p.title,
      p.description,
      p.category,
      p.budget,
      p.status,
      p.deadline,
      p.created_at,
      c.name AS client_name,
      c.company AS client_company,
      c.email AS client_email
    FROM projects p
    LEFT JOIN clients c ON p.client_id = c.id
    WHERE p.user_id = ?
    ORDER BY 
      CASE p.status
        WHEN 'In Progress' THEN 1
        WHEN 'Planning' THEN 2
        WHEN 'On Hold' THEN 3
        WHEN 'Completed' THEN 4
        ELSE 5
      END,
      p.deadline ASC
  `);
  return stmt.all(userId);
}

function createProject(userId, projectData) {
  const { clientId, title, description, category, budget, status, deadline } = projectData;
  const stmt = db.prepare(`
    INSERT INTO projects (user_id, client_id, title, description, category, budget, status, deadline)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    userId,
    clientId,
    title,
    description || '',
    category || 'Web Development',
    Number(budget) || 0,
    status || 'In Progress',
    deadline
  );
  return Number(info.lastInsertRowid);
}

function updateProject(projectId, userId, fields) {
  const current = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(projectId, userId);
  if (!current) return null;

  const title = fields.title !== undefined ? fields.title : current.title;
  const description = fields.description !== undefined ? fields.description : current.description;
  const category = fields.category !== undefined ? fields.category : current.category;
  const budget = fields.budget !== undefined ? Number(fields.budget) : current.budget;
  const status = fields.status !== undefined ? fields.status : current.status;
  const deadline = fields.deadline !== undefined ? fields.deadline : current.deadline;

  const stmt = db.prepare(`
    UPDATE projects
    SET title = ?, description = ?, category = ?, budget = ?, status = ?, deadline = ?
    WHERE id = ? AND user_id = ?
  `);
  stmt.run(title, description, category, budget, status, deadline, projectId, userId);
  return getProjectsByUserId(userId).find(p => p.id === projectId);
}

function deleteProject(projectId, userId) {
  const stmt = db.prepare('DELETE FROM projects WHERE id = ? AND user_id = ?');
  const res = stmt.run(projectId, userId);
  return res.changes > 0;
}

module.exports = {
  db,
  getUserByPhone,
  getUserById,
  createUser,
  getClientsByUserId,
  createClient,
  getProjectsByUserId,
  createProject,
  updateProject,
  deleteProject
};
