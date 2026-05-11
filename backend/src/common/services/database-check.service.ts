import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseCheckService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseCheckService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.checkMigrations();
    this.logger.log('✅ Database checks passed — ready to serve.');
  }

  private async checkMigrations(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      const hasTable = await queryRunner.hasTable('migrations');
      if (!hasTable) {
        this.logger.error(
          '✋ Migrations table does not exist — migrations have not been run.\n' +
            '   Run `npm run migration:run` to apply pending migrations.',
        );
        process.exit(1);
      }

      const executedRows = await queryRunner.query(`SELECT name FROM migrations ORDER BY name`);
      const executedNames = new Set<string>(executedRows.map((r: { name: string }) => r.name));

      const registeredMigrations = this.dataSource.migrations;

      if (registeredMigrations.length === 0) {
        this.logger.error(
          '✋ No migrations are registered in the DataSource.\n' +
            '   Cannot verify migration status. This may happen if compiled migration files are missing.\n' +
            '   Run `npm run build` then `npm run migration:run`.',
        );
        process.exit(1);
      }

      const pending = registeredMigrations.filter((m) => m.name && !executedNames.has(m.name));

      if (pending.length > 0) {
        this.logger.error(
          `✋ Pending migrations (${pending.length}): ${pending.map((m) => m.name).join(', ')}.\n` +
            `   Run \`npm run migration:run\` to apply them.`,
        );
        process.exit(1);
      }

      this.logger.log(`✅ All ${registeredMigrations.length} migration(s) have been applied.`);
    } finally {
      await queryRunner.release();
    }
  }
}
