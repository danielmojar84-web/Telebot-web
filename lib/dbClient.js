import pkg from 'pg';
import config from '../config.json' assert {type:'json'};
const { Pool } = pkg;

export class DBClient {
  constructor() {
    this.pool = new Pool({
      connectionString: config.db_url,
      ssl: { rejectUnauthorized: false }
    });
    this.ensureTables();
  }

  async ensureTables() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS bots (
        username TEXT PRIMARY KEY,
        token TEXT NOT NULL,
        adminId TEXT NOT NULL,
        prefix TEXT DEFAULT '/',
        status TEXT DEFAULT 'offline',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Table bots ensured.');
  }

  async insertOrUpdateBot(bot) {
    const { username, token, adminId, prefix, status } = bot;
    await this.pool.query(
      `INSERT INTO bots(username, token, adminId, prefix, status) 
       VALUES($1,$2,$3,$4,$5) 
       ON CONFLICT (username) DO UPDATE 
       SET token=$2, adminId=$3, prefix=$4, status=$5`,
      [username, token, adminId, prefix || '/', status || 'online']
    );
  }

  async listBots() {
    const res = await this.pool.query('SELECT * FROM bots');
    return res.rows;
  }

  async deleteBot(username) {
    await this.pool.query('DELETE FROM bots WHERE username=$1', [username]);
  }
}
