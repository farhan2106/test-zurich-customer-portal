import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropExtraClaimColumns1778463778260 implements MigrationInterface {
  name = 'DropExtraClaimColumns1778463778260';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "claims" DROP COLUMN "description2"`);
    await queryRunner.query(`ALTER TABLE "claims" DROP COLUMN "description3"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "claims" ADD "description2" text NOT NULL`);
    await queryRunner.query(`ALTER TABLE "claims" ADD "description3" text NOT NULL`);
  }
}
