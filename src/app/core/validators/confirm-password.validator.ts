import { AbstractControl, FormGroup } from '@angular/forms';

export function ConfirmPasswordValidator(control: any, matchingControl: any) {
  return () => {
    if (
      matchingControl.errors &&
      !matchingControl.errors['confirmPasswordValidator']
    ) {
      return null;
    }

    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ confirmPasswordValidator: true });
    } else {
      matchingControl.setErrors(null);
    }

    return null;
  };
}
