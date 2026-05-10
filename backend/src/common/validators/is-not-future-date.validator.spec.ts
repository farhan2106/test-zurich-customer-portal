import { validateSync } from 'class-validator';
import { IsNotFutureDate } from './is-not-future-date.validator';

class TestDto {
  @IsNotFutureDate()
  date: string;
}

describe('IsNotFutureDate Validator', () => {
  it('should pass validation for a past date', () => {
    const dto = new TestDto();
    dto.date = '2025-01-01';

    const errors = validateSync(dto);
    const dateErrors = errors.filter((e) => e.property === 'date');

    expect(dateErrors.length).toBe(0);
  });

  it('should pass validation for today\'s date', () => {
    const dto = new TestDto();
    dto.date = new Date().toISOString().slice(0, 10);

    const errors = validateSync(dto);
    const dateErrors = errors.filter((e) => e.property === 'date');

    expect(dateErrors.length).toBe(0);
  });

  it('should reject a future date', () => {
    const dto = new TestDto();
    dto.date = '2099-12-31';

    const errors = validateSync(dto);
    const dateErrors = errors.filter((e) => e.property === 'date');

    expect(dateErrors.length).toBeGreaterThan(0);
  });

  it('should have error message containing "must not be in the future"', () => {
    const dto = new TestDto();
    dto.date = '2099-12-31';

    const errors = validateSync(dto);
    const dateErrors = errors.filter((e) => e.property === 'date');

    expect(dateErrors.length).toBeGreaterThan(0);
    expect(dateErrors[0].constraints).toBeDefined();
    const constraintMessage = Object.values(dateErrors[0].constraints!)[0];
    expect(constraintMessage).toContain('must not be in the future');
  });
});
