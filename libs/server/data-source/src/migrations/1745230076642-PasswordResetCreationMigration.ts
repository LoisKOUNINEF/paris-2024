import { MigrationInterface, QueryRunner } from "typeorm";

export class PasswordResetCreationMigration1745230076642 implements MigrationInterface {
    name = 'PasswordResetCreationMigration1745230076642'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "password_reset" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "email" text NOT NULL,
                CONSTRAINT "UQ_password_reset_email" UNIQUE ("email"),
                CONSTRAINT "PK_8515e60a2cc41584fa4784f52ce" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "password_reset"
        `);
    }

}
