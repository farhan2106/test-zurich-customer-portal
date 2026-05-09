import { config } from 'dotenv';
import { resolve } from 'path';
import { DataSource } from 'typeorm';

// Load .env.test for test database configuration
config({ path: resolve(__dirname, '../../.env.test') });

export const testDbConfig = {
  type: 'postgres' as const,
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5433', 10),
  username: process.env.DB_USERNAME ?? 'zurich_test',
  password: process.env.DB_PASSWORD ?? 'zurich_test_pass',
  database: process.env.DB_DATABASE ?? 'CUSTOMER_BILLING_PORTAL_TEST',
  synchronize: true,
  logging: false,
};

/**
 * Creates a test DataSource with the configured test database settings.
 * Call `await dataSource.initialize()` before use.
 */
export function createTestDataSource(entities: any[]): DataSource {
  return new DataSource({
    ...testDbConfig,
    entities,
  });
}

/**
 * Attempts to initialize a DataSource and provides a clear error message
 * if the database is not running.
 */
export async function initializeTestDataSource(
  dataSource: DataSource,
): Promise<DataSource> {
  try {
    await dataSource.initialize();
    return dataSource;
  } catch (error: any) {
    if (
      error?.code === 'ECONNREFUSED' ||
      error?.message?.includes('connect') ||
      error?.message?.includes('connection')
    ) {
      throw new Error(
        `\n` +
          `❌ Cannot connect to test database at ${testDbConfig.host}:${testDbConfig.port}\n` +
          `   Database: ${testDbConfig.database}\n` +
          `   User: ${testDbConfig.username}\n\n` +
          `   The test PostgreSQL container is not running.\n` +
          `   Start it with:\n` +
          `     docker compose -f docker-compose.test.yml up -d\n\n` +
          `   Or run all tests with automatic DB lifecycle:\n` +
          `     npm run test:db\n`,
      );
    }
    throw error;
  }
}
