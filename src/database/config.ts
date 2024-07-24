module.exports = {
  development: {
    dialect: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'root',
    database: 'test',
  },
  test: {
    dialect: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'root',
    password: 'root',
    database: 'test-app',
  },
  production: {
    dialect: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'root',
    password: 'root',
    database: 'prod',
  },
};
