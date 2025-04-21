import { MigrationInterface, QueryRunner } from "typeorm";

export class UserCreationMigration1745230037725 implements MigrationInterface {
    name = 'UserCreationMigration1745230037725'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'staff', 'customer')
        `);
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "secret_key" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "first_name" text NOT NULL,
                "last_name" text NOT NULL,
                "email" text NOT NULL,
                "password" text NOT NULL,
                "role" "public"."user_role_enum" NOT NULL DEFAULT 'customer',
                "cart_id" text NOT NULL DEFAULT 'cart_id',
                "is_anonymized" boolean NOT NULL DEFAULT false,
                "last_login_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                CONSTRAINT "UQ_user_email" UNIQUE ("email"),
                CONSTRAINT "PK_user" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_user_email" ON "user" ("email")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_user_email"
        `);
        await queryRunner.query(`
            DROP TABLE "user"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."user_role_enum"
        `);
    }

}
