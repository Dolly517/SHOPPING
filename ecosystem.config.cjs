module.exports = {
  apps: [
    {
      name: 'shopwave',
      script: './backend/src/server.js',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        USE_SQLITE: 'true',
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_NAME: 'ecommerce',
        DB_USER: 'postgres',
        DB_PASS: 'password',
        JWT_SECRET: 'shopwave_super_secret_jwt_key_2024',
        STRIPE_SECRET_KEY: 'sk_test_placeholder',
        FRONTEND_URL: 'http://localhost:3000',
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
    },
  ],
};
