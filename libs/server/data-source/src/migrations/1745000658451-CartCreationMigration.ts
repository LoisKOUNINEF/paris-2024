import { MigrationInterface, QueryRunner } from "typeorm";

export class CartCreationMigration1745000658451 implements MigrationInterface {
    name = 'CartCreationMigration1745000658451'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "cart" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "guestToken" text,
                "userId" text,
                CONSTRAINT "PK_cart" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_cart_guestToken" ON "cart" ("guestToken")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_cart_userId" ON "cart" ("userId")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_cart_userId"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_cart_guestToken"
        `);
        await queryRunner.query(`
            DROP TABLE "cart"
        `);
    }

}
