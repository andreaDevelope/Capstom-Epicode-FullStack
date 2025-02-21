import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidatorsFasciaOraria {
  static validateFasciaOraria(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const start = group.get('start')?.value;
      const end = group.get('end')?.value;

      if (!start || !end) {
        return null;
      }

      const startTime = new Date(`1970-01-01T${start}:00`).getTime();
      const endTime = new Date(`1970-01-01T${end}:00`).getTime();

      if (endTime - startTime < 3600000) {
        return { timeTooShort: true };
      }

      return null;
    };
  }
}
