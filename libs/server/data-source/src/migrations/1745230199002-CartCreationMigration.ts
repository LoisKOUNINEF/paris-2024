import { MigrationInterface, QueryRunner } from "typeorm";

export class CartCreationMigration1745230199002 implements MigrationInterface {
    name = 'CartCreationMigration1745230199002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "cart" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "guest_token" text,
                "user_id" text,
                CONSTRAINT "PK_cart" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_cart_guest_token" ON "cart" ("guest_token")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_cart_user_id" ON "cart" ("user_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_cart_user_id"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_cart_guest_token"
        `);
        await queryRunner.query(`
            DROP TABLE "cart"
        `);
    }

}
