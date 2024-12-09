import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTable1733705384671 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create 'products' table
    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'categoryId', type: 'int', isNullable: false },
          { name: 'categoryName', type: 'varchar', isNullable: false },
          { name: 'sku', type: 'varchar', isNullable: false },
          { name: 'name', type: 'varchar', isNullable: false },
          { name: 'description', type: 'text', isNullable: true },
          {
            name: 'weight',
            type: 'numeric',
            isNullable: false,
          },
          {
            name: 'width',
            type: 'numeric',
            isNullable: false,
          },
          {
            name: 'length',
            type: 'numeric',
            isNullable: false,
          },
          {
            name: 'height',
            type: 'numeric',
            isNullable: false,
          },
          { name: 'image', type: 'varchar', isNullable: false },
          {
            name: 'harga',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
        ],
      }),
    );

    // Create 'audit_logs' table
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'entity', type: 'varchar', isNullable: false },
          { name: 'operation', type: 'varchar', isNullable: false },
          { name: 'changes', type: 'text', isNullable: false },
          {
            name: 'userId',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'timestamp',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    // Create 'checkouts' table
    await queryRunner.createTable(
      new Table({
        name: 'checkouts',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'userId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'items',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'totalPrice',
            type: 'numeric',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            isNullable: false,
            default: `'pending'`,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('checkouts');
    await queryRunner.dropTable('audit_logs');
    await queryRunner.dropTable('products');
  }
}
