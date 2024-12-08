import { StringNumberBigintObjectType } from 'src/core/types/string-number-bigint-object.type';
import { CreateProductDto } from './create-product.dto';

/**
 * @extends CreateProductDto
 */
export class ItemsProductDto extends CreateProductDto {
  static readonly propertyConfig: Partial<
    Record<
      keyof ItemsProductDto,
      {
        dataType: StringNumberBigintObjectType;
        maxLength?: number;
      }
    >
  > = {
    categoryId: {
      dataType: 'number',
      maxLength: 255,
    },
    categoryName: {
      dataType: 'string',
      maxLength: 255,
    },
    sku: {
      dataType: 'string',
      maxLength: 255,
    },
    name: {
      dataType: 'string',
      maxLength: 255,
    },
    description: {
      dataType: 'string',
      maxLength: 1000000000000,
    },
    weight: {
      dataType: 'number',
      maxLength: 5,
    },
    width: {
      dataType: 'number',
      maxLength: 5,
    },
    length: {
      dataType: 'number',
      maxLength: 5,
    },
    height: {
      dataType: 'number',
      maxLength: 5,
    },
    image: {
      dataType: 'string',
      maxLength: 255,
    },
    harga: {
      dataType: 'number',
      maxLength: 255,
    },
  };

  static readonly propertyNames: (keyof ItemsProductDto)[] = [
    'categoryId',
    'categoryName',
    'sku',
    'name',
    'description',
    'weight',
    'width',
    'length',
    'height',
    'image',
    'harga',
  ];
}
