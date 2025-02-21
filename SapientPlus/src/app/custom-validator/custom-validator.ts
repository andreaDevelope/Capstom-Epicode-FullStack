import { FormGroup } from '@angular/forms';

export class CustomValidators {
  static passwordsMatch() {
    return (formGroup: FormGroup) => {
      const password = formGroup.get('password');
      const confirmPassword = formGroup.get('confirmPassword');

      if (!password || !confirmPassword) {
        return null;
      }

      if (
        confirmPassword.errors &&
        !confirmPassword.errors['passwordsMismatch']
      ) {
        return null;
      }

      if (confirmPassword.dirty || confirmPassword.touched) {
        if (password.value !== confirmPassword.value) {
          confirmPassword.setErrors({ passwordsMismatch: true });
        } else {
          confirmPassword.setErrors(null);
        }
      }

      return null;
    };
  }
}
