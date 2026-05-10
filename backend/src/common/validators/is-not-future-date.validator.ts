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
          const inputDate = new Date(value);
          if (isNaN(inputDate.getTime())) return false;

          // Normalize to end-of-day for date-only comparison (avoids timezone bugs)
          const today = new Date();
          today.setHours(23, 59, 59, 999);

          return inputDate.getTime() <= today.getTime();
        },
        defaultMessage() {
          return 'incidentDate must not be in the future';
        },
      },
    });
  };
}
