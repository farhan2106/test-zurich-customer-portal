import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
config();

const typeOrmDataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'zurich',
  password: process.env.DB_PASSWORD ?? 'zurich_pass',
  database: process.env.DB_DATABASE ?? 'CUSTOMER_BILLING_PORTAL',
  entities: ['dist/**/*.entity.js'],
  migrations: [__dirname + '/../migrations/**/*{.js,.ts}'],
  migrationsTableName: 'migrations',
};

export default new DataSource(typeOrmDataSourceOptions);
export { typeOrmDataSourceOptions };
