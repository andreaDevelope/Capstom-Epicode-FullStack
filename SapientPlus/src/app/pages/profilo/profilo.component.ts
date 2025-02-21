import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { iStudent } from '../../interfaces/i-student';
import { Router } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { AvatarService } from '../../services/avatar.service';
import { take } from 'rxjs';
import { MateriaService } from '../../services/materia.service';
import { iMateria } from '../../interfaces/i-materia';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-profile',
  templateUrl: './profilo.component.html',
  styleUrls: ['./profilo.component.scss'],
})
export class ProfiloComponent implements OnInit {
  user!: Partial<iStudent>;
  profileForm!: FormGroup;
  isEditing: boolean = false;
  isUpdate: boolean = true;
  isAvatarUploading: boolean = false;
  usernameError: string | null = null;
  emailError: string | null = null;
  materieDisponibili: iMateria[] = [];
  isMateriaCustom: boolean = false;
  livelliMaterie: string[] = ['base', 'intermedio', 'avanzato'];
  materieSalvate: iMateria[] = [];
  isDarkMode!: boolean;

  selectedFile?: File;
  selectedAvatarPreview?: string;

  @ViewChild('sidenavContainer') sidenavContainer!: ElementRef;

  constructor(
    private authService: AuthService,
    private studentService: StudentService,
    private avatarService: AvatarService,
    private fb: FormBuilder,
    private router: Router,
    private materiaService: MateriaService,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.isDarkMode = this.cookieService.get('darkMode') === 'true';
    this.authService.user$.pipe(take(1)).subscribe((user) => {
      if (!user) return;

      this.user = user as iStudent;

      const accessData = this.authService.authSubject$.getValue();
      if (accessData?.primoLogin) {
        this.isEditing = true;
        this.isUpdate = true;
      }

      this.studentService.getMentorById(this.user.id!).subscribe({
        next: (response) => {
          this.materieSalvate = response.materie ? [...response.materie] : [];
        },
        error: (err) => {
          console.error('Errore nel caricamento delle materie:', err);
        },
      });

      this.profileForm = this.fb.group({
        username: [{ value: user.username, disabled: true }],
        password: [{ value: user.password, disabled: true }],
        nome: [{ value: user.nome, disabled: true }],
        cognome: [{ value: user.cognome, disabled: true }],
        email: [{ value: user.email, disabled: true }],
        whatsapp: [{ value: user.whatsapp, disabled: true }],
        materie: this.fb.array(
          user.materie?.map((m: any) => this.fb.group(m)) || []
        ),
        materiaCustomName: [''],
        materiaCustomLevel: [''],
      });

      this.loadMaterieDisponibili();

      this.materieSalvate = [...(user.materie || [])];

      if (user.materie && user.materie.length > 0) {
        this.updateMaterieUI(user.materie);
      }
    });
  }

  loadMaterieDisponibili() {
    this.materiaService.getAllMaterie().subscribe({
      next: (data) => {
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

        const tutteLeMaterie = [...materieBase, ...(data || [])];

        this.materieDisponibili = tutteLeMaterie.filter(
          (materia, index, self) =>
            index ===
            self.findIndex(
              (m) =>
                m.nome.toLowerCase() === materia.nome.toLowerCase() &&
                m.livello.toLowerCase() === materia.livello.toLowerCase()
            )
        );

        console.log('Materie disponibili caricate:', this.materieDisponibili);
      },
      error: (err) => {
        console.error('Errore nel recupero delle materie:', err);
        this.materieDisponibili = [...this.materieDisponibili];
      },
    });
  }

  get materieFormArray() {
    return this.profileForm.get('materie') as FormArray;
  }

  updateMaterieUI(materie: iMateria[]) {
    const materieArray = this.materieFormArray;
    materieArray.clear();

    materie.forEach((materia) => {
      materieArray.push(this.fb.group(materia));
    });

    this.profileForm.updateValueAndValidity();
    console.log('Materie aggiornate nella UI:', materieArray.value);
  }

  addMateria(materia: iMateria) {
    console.log('Materia selezionata:', materia);

    if (!materia || !materia.nome || !materia.livello) return;

    const materieArray = this.materieFormArray;

    if (
      !materieArray.value.some(
        (m: iMateria) =>
          m.nome.toLowerCase() === materia.nome.toLowerCase() &&
          m.livello.toLowerCase() === materia.livello.toLowerCase()
      )
    ) {
      materieArray.push(this.fb.group(materia));
      this.materieSalvate.push(materia);
      const accessData = this.authService.authSubject$.getValue();
      if (accessData?.primoLogin) {
        accessData.primoLogin = false;

        this.authService.authSubject$.next(accessData);

        this.authService.updatePrimoLogin(false);
      }

      console.log(
        'Materie nel form dopo aggiunta:',
        this.materieFormArray.value
      );
    }
  }

  confermaMateriaPersonalizzata() {
    const nomeMateria = this.profileForm
      .get('materiaCustomName')
      ?.value?.trim();
    const livelloMateria = this.profileForm
      .get('materiaCustomLevel')
      ?.value?.trim();

    if (!nomeMateria || !livelloMateria) {
      console.warn(
        'Nome e livello della materia personalizzata sono obbligatori.'
      );
      return;
    }

    const newMateria: iMateria = { nome: nomeMateria, livello: livelloMateria };

    if (
      !this.materieFormArray.value.some(
        (m: iMateria) =>
          m.nome.toLowerCase() === newMateria.nome.toLowerCase() &&
          m.livello.toLowerCase() === newMateria.livello.toLowerCase()
      )
    ) {
      this.materieFormArray.push(this.fb.group(newMateria));
    }

    this.profileForm.patchValue({
      materiaCustomName: '',
      materiaCustomLevel: '',
    });

    this.isMateriaCustom = false;
  }

  removeMateria(index: number) {
    this.materieFormArray.removeAt(index);
    this.materieSalvate.splice(index, 1);
  }

  onSelectAltro() {
    this.isMateriaCustom = !this.isMateriaCustom;
    if (this.isMateriaCustom) {
      this.profileForm.patchValue({
        materiaCustomName: '',
        materiaCustomLevel: '',
      });
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.profileForm.get('username')?.enable();
      this.profileForm.get('password')?.enable();
      this.profileForm.get('nome')?.enable();
      this.profileForm.get('cognome')?.enable();
      this.profileForm.get('email')?.enable();
      this.profileForm.get('whatsapp')?.enable();
      this.profileForm.get('materie')?.enable();
    } else {
      this.profileForm.get('username')?.disable();
      this.profileForm.get('password')?.disable();
      this.profileForm.get('nome')?.disable();
      this.profileForm.get('cognome')?.disable();
      this.profileForm.get('email')?.disable();
      this.profileForm.get('whatsapp')?.disable();
      this.profileForm.get('materie')?.disable();
    }
  }

  saveProfile() {
    if (!this.profileForm.valid || !this.user?.id) {
      alert('Compila tutti i campi correttamente.');
      return;
    }

    this.usernameError = null;
    this.emailError = null;

    const updatedUser = { ...this.user, ...this.profileForm.value };

    updatedUser.materie = this.materieFormArray.value.map((materia: any) => ({
      nome: materia.nome,
      livello: materia.livello,
    }));

    console.log('Dati aggiornati:', updatedUser);

    this.studentService.updateProfile(updatedUser, this.user.id).subscribe({
      next: (response) => {
        this.studentService.getMentorById(this.user.id!).subscribe({
          next: (updatedUser) => {
            this.materieSalvate = updatedUser.materie
              ? [...updatedUser.materie]
              : [];
          },
          error: (err) => {
            console.error(
              'Errore nel recupero delle materie dopo update:',
              err
            );
          },
        });
        console.log('Profilo aggiornato con successo!', response);
        alert('Profilo aggiornato!');

        this.user = { ...this.user, ...response };
        this.profileForm.patchValue({
          username: response.username,
          nome: response.nome,
          cognome: response.cognome,
          email: response.email,
          whatsapp: response.whatsapp,
        });

        this.materieSalvate = response.materie ? [...response.materie] : [];

        this.updateMaterieUI(response.materie || []);

        if (updatedUser.username !== this.user.username) {
          alert(
            'Hai cambiato username, verrai disconnesso per applicare le modifiche.'
          );
          this.logout();
        } else {
          this.isEditing = false;
          this.profileForm.disable();
        }
      },
      error: (err) => {
        const errorMessage = err.error?.message;

        if (errorMessage) {
          if (errorMessage.includes('Username già in uso')) {
            this.usernameError = 'Username già in uso. Scegli un altro.';
            this.profileForm.get('username')?.setErrors({ unique: true });
          }

          if (errorMessage.includes('Email già in uso')) {
            this.emailError = "Email già in uso. Scegli un'altra.";
            this.profileForm.get('email')?.setErrors({ unique: true });
          }
        }
      },
    });
  }

  refreshMaterie() {
    if (!this.user?.id) return;

    this.studentService.getMentorById(this.user.id!).subscribe({
      next: (response) => {
        this.materieSalvate = response.materie ? [...response.materie] : [];
        console.log('Materie aggiornate:', this.materieSalvate);
      },
      error: (err) => {
        console.error('Errore nel refresh delle materie:', err);
      },
    });
  }

  saveMaterie() {
    if (!this.user?.id) {
      console.error('ID studente non valido');
      return;
    }

    const materieDaSalvare = this.materieFormArray.value;
    console.log('Salvando materie per lo studente:', materieDaSalvare);

    materieDaSalvare.forEach((materia: iMateria) => {
      this.materiaService.createMateria(materia).subscribe({
        next: (response) => {
          console.log('Materia salvata con successo:', response);
        },
        error: (error) => {
          console.error('Errore nel salvataggio della materia:', error);
        },
      });
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  update() {
    if (this.isAvatarUploading) return;
    this.isUpdate = !this.isUpdate;
    if (!this.isUpdate) {
      this.isEditing = false;
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedAvatarPreview = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }

    this.isAvatarUploading = true;
  }

  uploadAvatar(userId?: number) {
    if (!this.selectedFile) {
      alert('Seleziona un file prima di caricare.');
      return;
    }

    if (userId === undefined) {
      alert('ID utente non valido!');
      return;
    }

    this.avatarService.uploadAvatar(this.selectedFile, userId).subscribe({
      next: (response) => {
        console.log('Avatar aggiornato con successo!', response);
        alert('Avatar aggiornato!');
        this.isAvatarUploading = false;
        this.cancelSelection();
      },
      error: (err) => {
        console.error("Errore durante il caricamento dell'avatar:", err);
        alert("Errore durante il caricamento dell'avatar");
      },
    });
  }

  cancelSelection() {
    this.selectedFile = undefined;
    this.selectedAvatarPreview = undefined;
  }
}
