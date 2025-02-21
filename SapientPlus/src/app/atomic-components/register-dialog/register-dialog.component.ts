import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { iMateria } from '../../interfaces/i-materia';
import { AuthService } from '../../services/auth.service';
import { CustomValidators } from '../../custom-validator/custom-validator';
import { CustomValidatorsMaterie } from '../../custom-validator/custom-validators-materie';
import { MatDialogRef } from '@angular/material/dialog';
import { CustomValidatorsFasciaOraria } from '../../custom-validator/custom-validate-fascia-oraria';
import { MateriaService } from '../../services/materia.service';

@Component({
  selector: 'app-register-dialog',
  templateUrl: './register-dialog.component.html',
  styleUrls: ['./register-dialog.component.scss'],
})
export class RegisterDialogComponent {
  private isResetting: boolean = false;
  signupForm!: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;

  materieDisponibili: iMateria[] = [];

  materiaCustomName: string = '';
  materiaCustomLevel: string = '';
  isMateriaCustom: boolean = false;

  livelliMaterie: string[] = ['base', 'intermedio', 'avanzato'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private dialogRef: MatDialogRef<RegisterDialogComponent>,
    private materiaService: MateriaService
  ) {
    this.initForm();
  }

  ngOnInit() {
    const materieBase: iMateria[] = [
      { nome: 'matematica', livello: 'base' },
      { nome: 'matematica', livello: 'intermedio' },
      { nome: 'matematica', livello: 'avanzato' },
      { nome: 'inglese', livello: 'base' },
      { nome: 'inglese', livello: 'intermedio' },
      { nome: 'inglese', livello: 'avanzato' },
      { nome: 'scienze', livello: 'base' },
      { nome: 'scienze', livello: 'intermedio' },
      { nome: 'scienze', livello: 'avanzato' },
    ];

    this.materiaService.getAllMaterie().subscribe({
      next: (data) => {
        const materieUniche = [...materieBase, ...data].reduce(
          (acc, materia) => {
            const esiste = acc.some(
              (m) =>
                m.nome.toLowerCase() === materia.nome.toLowerCase() &&
                m.livello.toLowerCase() === materia.livello.toLowerCase()
            );
            if (!esiste) acc.push(materia);
            return acc;
          },
          [] as iMateria[]
        );

        this.materieDisponibili = materieUniche;
      },
      error: (err) => {
        console.error('Errore nel recupero materie:', err);
        this.materieDisponibili = materieBase;
      },
    });
  }

  initForm() {
    this.signupForm = this.fb.group(
      {
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.pattern(
              '^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[0-9]).{6,}$'
            ),
          ],
        ],
        confirmPassword: ['', Validators.required],
        nome: ['', Validators.required],
        cognome: ['', Validators.required],
        whatsapp: ['', Validators.required],
        ruolo: ['ROLE_STUDENT', Validators.required],
        materie: this.fb.array([]),
        fasciaOraria: this.fb.group(
          {
            start: [''],
            end: [''],
          },
          { validators: CustomValidatorsFasciaOraria.validateFasciaOraria() }
        ),
        sottoscrizioneAbbonamento: [false],
        materiaCustomName: [''],
        materiaCustomLevel: [''],
      },
      { validators: CustomValidators.passwordsMatch() }
    );

    this.signupForm.get('ruolo')?.valueChanges.subscribe((newRole) => {
      if (this.isResetting) return;
      this.isResetting = true;

      try {
        const formattedRole = newRole.startsWith('ROLE_')
          ? newRole
          : `ROLE_${newRole.toUpperCase()}`;

        this.signupForm.reset({
          username: this.signupForm.get('username')?.value,
          email: this.signupForm.get('email')?.value,
          nome: this.signupForm.get('nome')?.value,
          cognome: this.signupForm.get('cognome')?.value,
          password: '',
          confirmPassword: '',
          ruolo: formattedRole,
          materie: [],
          fasciaOraria: {
            start: '',
            end: '',
          },
          sottoscrizioneAbbonamento: false,
          materiaCustomName: [''],
          materiaCustomLevel: [''],
        });

        this.updateValidators(formattedRole);
      } finally {
        this.isResetting = false;
      }
    });
  }

  updateValidators(role: string) {
    const sottoscrizioneControl = this.signupForm.get(
      'sottoscrizioneAbbonamento'
    );
    const fasciaOrariaGroup = this.signupForm.get('fasciaOraria');
    const materieArray = this.signupForm.get('materie') as FormArray;

    if (role === 'ROLE_MENTOR') {
      sottoscrizioneControl?.setValidators(Validators.requiredTrue);
      fasciaOrariaGroup?.get('start')?.setValidators(Validators.required);
      fasciaOrariaGroup?.get('end')?.setValidators(Validators.required);
      materieArray.setValidators(CustomValidatorsMaterie.validateMaterie());
      fasciaOrariaGroup?.setValidators(
        CustomValidatorsFasciaOraria.validateFasciaOraria()
      );
    } else {
      sottoscrizioneControl?.clearValidators();
      fasciaOrariaGroup?.get('start')?.clearValidators();
      fasciaOrariaGroup?.get('end')?.clearValidators();
      materieArray.clearValidators();
      fasciaOrariaGroup?.clearValidators();
    }

    sottoscrizioneControl?.updateValueAndValidity();
    fasciaOrariaGroup?.get('start')?.updateValueAndValidity();
    fasciaOrariaGroup?.get('end')?.updateValueAndValidity();
    materieArray.updateValueAndValidity();
    fasciaOrariaGroup?.updateValueAndValidity();
  }

  get ruoloControl(): FormControl {
    return this.signupForm.get('ruolo') as FormControl;
  }

  get isMentor(): boolean {
    return this.signupForm.get('ruolo')?.value === 'ROLE_MENTOR';
  }

  get materieFormArray(): FormArray {
    return this.signupForm.get('materie') as FormArray;
  }

  onSelectMateria(materia: any) {
    if (materia === 'altro') {
      this.isMateriaCustom = true;
    } else if (materia && materia.nome && materia.livello) {
      this.addMateria(materia);
    } else {
      console.warn('Selezionata una materia non valida:', materia);
    }
  }

  addMateria(materia: iMateria) {
    if (
      !this.materieFormArray.controls.some(
        (control) =>
          control.value.nome.toLowerCase() === materia.nome.toLowerCase() &&
          control.value.livello.toLowerCase() === materia.livello.toLowerCase()
      )
    ) {
      this.materieFormArray.push(this.fb.group(materia));
    }
  }

  removeMateria(index: number) {
    this.materieFormArray.removeAt(index);
  }

  onSelectAltro() {
    this.isMateriaCustom = !this.isMateriaCustom;
    if (this.isMateriaCustom) {
      this.signupForm.patchValue({
        materiaCustomName: '',
        materiaCustomLevel: '',
      });
    }
  }

  confermaMateriaPersonalizzata() {
    const nomeMateria = this.signupForm
      .get('materiaCustomName')
      ?.value?.trim()
      .toLowerCase();
    const livelloMateria = this.signupForm
      .get('materiaCustomLevel')
      ?.value?.trim();

    if (!nomeMateria || !livelloMateria) {
      console.warn(
        'Nome e livello della materia personalizzata sono obbligatori.'
      );
      return;
    }

    const newMateria: iMateria = {
      nome: nomeMateria,
      livello: livelloMateria,
    };

    console.log('Aggiungendo materia personalizzata:', newMateria);

    const esiste = this.materieFormArray.controls.some(
      (control) =>
        control.value.nome.toLowerCase() === newMateria.nome.toLowerCase() &&
        control.value.livello.toLowerCase() === newMateria.livello.toLowerCase()
    );

    if (!esiste) {
      this.materieFormArray.push(this.fb.group(newMateria));
      console.log('Materia personalizzata aggiunta con successo.');
    } else {
      console.warn('Questa materia è già stata selezionata.');
    }

    this.materiaCustomName = '';
    this.materiaCustomLevel = '';
    this.isMateriaCustom = false;

    this.signupForm.get('materie')?.updateValueAndValidity();
  }

  signup() {
    const password = this.signupForm.get('password')?.value;
    const confirmPassword = this.signupForm.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      console.error('Le password non corrispondono');
      this.signupForm
        .get('confirmPassword')
        ?.setErrors({ passwordsMismatch: true });
      return;
    }

    if (this.signupForm.valid) {
      const formValue = { ...this.signupForm.value };

      const formattedRole = formValue.ruolo.startsWith('ROLE_')
        ? formValue.ruolo
        : `ROLE_${formValue.ruolo.toUpperCase()}`;

      const payload: any = {
        username: formValue.username,
        email: formValue.email,
        whatsapp: formValue.whatsapp,
        password: formValue.password,
        nome: formValue.nome,
        cognome: formValue.cognome,
        ruolo: formattedRole,
        sottoscrizioneAbbonamento: formValue.sottoscrizioneAbbonamento,
      };

      if (formattedRole === 'ROLE_MENTOR') {
        payload.materie = formValue.materie;
        payload.fasciaOrariaInizio = formValue.fasciaOraria.start;
        payload.fasciaOrariaFine = formValue.fasciaOraria.end;
      }

      this.authService.register(payload).subscribe({
        next: (response) => {
          console.log(' Registrazione completata:', response);

          this.authService.restoreUser();
          this.dialogRef.close();

          if (!response.user || !response.user.emailVerificata) {
            alert('Devi verificare la tua email prima di accedere.');
            this.router.navigate(['/verify-email']);
          } else if (
            formattedRole === 'ROLE_MENTOR' &&
            formValue.sottoscrizioneAbbonamento
          ) {
            this.router.navigate(['/abbonamento']);
          } else {
            this.router.navigate(['/login']);
          }
        },
        error: (error) => {
          console.error('Errore durante la registrazione:', error);

          if (error.status === 409) {
            if (error.error.message.includes('Username già in uso')) {
              this.signupForm
                .get('username')
                ?.setErrors({ usernameInUse: true });
            }
            if (error.error.message.includes('Email già in uso')) {
              this.signupForm.get('email')?.setErrors({ emailInUse: true });
            }
          }
        },
      });
    } else {
      console.error('Il modulo non è valido');
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  isChecked: boolean = false;

  toggleSelection(role: string) {
    this.isChecked = !this.isChecked;
  }
}
