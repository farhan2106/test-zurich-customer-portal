import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsNotFutureDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotFutureDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!value) return true; // Let @IsNotEmpty handle empty
          const date = new Date(value);
          if (isNaN(date.getTime())) return false;
          return date <= new Date();
        },
        defaultMessage() {
          return 'incidentDate must not be in the future';
        },
      },
    });
  };
}
