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
          await pool.query(
            "DELETE FROM users WHERE email != 'macinessa365@gmail.com'",
          );
          await pool.end();
          return null;
        },
        async 'db:seed-user'({ email, password, name, role }) {
          const { Pool } = require('pg');
          const bcrypt = require('bcryptjs');
          const pool = new Pool({
            connectionString:
              'postgresql://admin:password@localhost:5432/appdb',
          });
          const hash = await bcrypt.hash(password, 10);
          const { rows } = await pool.query(
            'INSERT INTO users (email, name, password_hash, role, provider) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO UPDATE SET password_hash = $3, role = $4 RETURNING *',
            [email, name, hash, role || 'customer', 'local'],
          );
          await pool.end();
          return rows[0];
        },
      });

      return config;
    },
  },
});
