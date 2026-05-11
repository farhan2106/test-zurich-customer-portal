import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1778463778259 implements MigrationInterface {
    name = 'InitialSchema1778463778259'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "claims" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "claimNumber" character varying NOT NULL, "policyId" uuid NOT NULL, "customerId" uuid NOT NULL, "type" "public"."claims_type_enum" NOT NULL, "description" text NOT NULL, "description2" text NOT NULL, "incidentDate" TIMESTAMP NOT NULL, "incidentLocation" character varying(500), "status" "public"."claims_status_enum" NOT NULL DEFAULT 'submitted', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ae47a48242e9feaa7e202e344c9" UNIQUE ("claimNumber"), CONSTRAINT "PK_96c91970c0dcb2f69fdccd0a698" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "customers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(320) NOT NULL, "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "photoUrl" character varying(500), "location" "public"."customers_location_enum" NOT NULL, "premiumPaid" numeric(10,2) NOT NULL DEFAULT '0', "role" "public"."customers_role_enum" NOT NULL DEFAULT 'customer', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_8536b8b85c06969f84f0c098b03" UNIQUE ("email"), CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "policies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "policyNumber" character varying NOT NULL, "customerId" uuid NOT NULL, "productId" uuid NOT NULL, "status" "public"."policies_status_enum" NOT NULL DEFAULT 'active', "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "premiumAmount" numeric(10,2) NOT NULL, "location" "public"."policies_location_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a8802538a5b1523552e79d49c7d" UNIQUE ("policyNumber"), CONSTRAINT "PK_603e09f183df0108d8695c57e28" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "productCode" integer NOT NULL, "name" character varying(200) NOT NULL, "description" text, "coverageDetails" text, "basePremium" numeric(10,2) NOT NULL, "status" "public"."products_status_enum" NOT NULL DEFAULT 'active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3146a8c669fc3f362c02fa9e0ba" UNIQUE ("productCode"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "claims" ADD CONSTRAINT "FK_cea536bf1c443b4d4c207a436fd" FOREIGN KEY ("policyId") REFERENCES "policies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "claims" ADD CONSTRAINT "FK_8003b148efab49dd30f8bb2516e" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "policies" ADD CONSTRAINT "FK_e34db8f7611187a907c9dc878a3" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "policies" ADD CONSTRAINT "FK_6c10643df2991a365c297d7f283" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "policies" DROP CONSTRAINT "FK_6c10643df2991a365c297d7f283"`);
        await queryRunner.query(`ALTER TABLE "policies" DROP CONSTRAINT "FK_e34db8f7611187a907c9dc878a3"`);
        await queryRunner.query(`ALTER TABLE "claims" DROP CONSTRAINT "FK_8003b148efab49dd30f8bb2516e"`);
        await queryRunner.query(`ALTER TABLE "claims" DROP CONSTRAINT "FK_cea536bf1c443b4d4c207a436fd"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TABLE "policies"`);
        await queryRunner.query(`DROP TABLE "customers"`);
        await queryRunner.query(`DROP TABLE "claims"`);
    }

}
