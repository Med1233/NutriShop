import { defineConfig } from 'cypress';
import createBundler from '@bahmutov/cypress-esbuild-preprocessor';
import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor';
import { createEsbuildPlugin } from '@badeball/cypress-cucumber-preprocessor/esbuild';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/features/**/*.feature',
    async setupNodeEvents(on, config) {
      await addCucumberPreprocessorPlugin(on, config);
      on(
        'file:preprocessor',
        createBundler({
          plugins: [createEsbuildPlugin(config)],
        }),
      );

      // DB tasks for test isolation
      on('task', {
        async 'db:reset'() {
          const { Pool } = require('pg');
          const pool = new Pool({
            connectionString:
              'postgresql://admin:password@localhost:5432/appdb',
          });
          await pool.query('DELETE FROM order_items');
          await pool.query('DELETE FROM cart_items');
          await pool.query('DELETE FROM orders');
          await pool.query('DELETE FROM refresh_tokens');
          await pool.query('DELETE FROM verification_tokens');
          const adminEmail = process.env.ADMIN_EMAIL || 'admin@nutrishop.test';
          await pool.query('DELETE FROM users WHERE email != $1', [adminEmail]);
          await pool.end();
          return null;
        },
        async 'db:seed-user'({ email, password, name, role, email_verified }) {
          const { Pool } = require('pg');
          const bcrypt = require('bcryptjs');
          const pool = new Pool({
            connectionString:
              'postgresql://admin:password@localhost:5432/appdb',
          });
          const hash = await bcrypt.hash(password, 10);
          const verified =
            email_verified !== undefined ? email_verified : false;
          const { rows } = await pool.query(
            'INSERT INTO users (email, name, password_hash, role, provider, email_verified) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (email) DO UPDATE SET password_hash = $3, role = $4, email_verified = $6 RETURNING *',
            [email, name, hash, role || 'customer', 'local', verified],
          );
          await pool.end();
          return rows[0];
        },
        async 'db:create-verification-token'({ email }) {
          const { Pool } = require('pg');
          const crypto = require('crypto');
          const pool = new Pool({
            connectionString:
              'postgresql://admin:password@localhost:5432/appdb',
          });
          const {
            rows: [user],
          } = await pool.query('SELECT id FROM users WHERE email = $1', [
            email,
          ]);
          if (!user) {
            await pool.end();
            return null;
          }
          const token = crypto.randomBytes(32).toString('hex');
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
          await pool.query(
            'DELETE FROM verification_tokens WHERE user_id = $1',
            [user.id],
          );
          await pool.query(
            'INSERT INTO verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
            [user.id, token, expiresAt],
          );
          await pool.end();
          return token;
        },
      });

      return config;
    },
  },
});
