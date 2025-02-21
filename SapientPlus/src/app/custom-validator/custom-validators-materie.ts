import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  FormArray,
} from '@angular/forms';

export class CustomValidatorsMaterie {
  static validateMaterie(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const materieArray = control as FormArray;

      if (
        materieArray.parent?.get('ruolo')?.value === 'mentor' &&
        materieArray.length === 0
      ) {
        return { requiredMaterie: true };
      }

      return null;
    };
  }
}
