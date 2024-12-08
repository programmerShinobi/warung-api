import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateProductsAndAuditLogs1733647478877
  implements MigrationInterface
{
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
            name: 'timestamp',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('audit_logs');
    await queryRunner.dropTable('products');
  }
}
