const db = require('./db');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('maxadu07', salt);

    // Get the only user or specify email if needed
    const users = await db.query('SELECT * FROM users LIMIT 1');
    if (users.rows.length === 0) {
      console.log('No users found in database');
      process.exit(1);
    }
    
    const user = users.rows[0];
    console.log(`Resetting password for user: ${user.email} (${user.full_name})`);

    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, user.id]);
    
    console.log(`Password successfully reset to 'maxadu07' for ${user.email}`);
    process.exit(0);
  } catch (err) {
    console.error('Error resetting password:', err);
    process.exit(1);
  }
}

resetPassword();
