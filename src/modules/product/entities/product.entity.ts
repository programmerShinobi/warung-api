import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Entity untuk produk yang merepresentasikan tabel 'products'.
 */
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  categoryId: number;

  @Column('varchar')
  categoryName: string;

  @Column('varchar')
  sku: string;

  @Column('varchar')
  name: string;

  @Column('text', { nullable: true })
  description: string | null;

  @Column('numeric')
  weight: number;

  @Column('numeric')
  width: number;

  @Column('numeric')
  length: number;

  @Column('numeric')
  height: number;

  @Column('varchar')
  image: string;

  @Column('numeric', { precision: 10, scale: 2 })
  harga: number;
}
