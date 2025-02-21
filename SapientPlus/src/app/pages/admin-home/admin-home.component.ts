import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { iStudent } from '../../interfaces/i-student';
import { Router } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { AvatarService } from '../../services/avatar.service';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.scss',
})
export class AdminHomeComponent {
  user!: Partial<iStudent>;
  profileForm!: FormGroup;
  isEditing: boolean = false;
  isUpdate: boolean = false;
  usernameError: string | null = null;
  emailError: string | null = null;

  selectedFile?: File;
  selectedAvatarPreview?: string;

  constructor(
    private authService: AuthService,
    private studentService: StudentService,
    private avatarService: AvatarService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      if (!user) {
        console.error('Nessun utente autenticato!');
        return;
      }

      this.user = user as iStudent;

      this.profileForm = this.fb.group({
        username: [{ value: user.username, disabled: true }],
        password: [{ value: user.password, disabled: true }],
        nome: [{ value: user.nome, disabled: true }],
        cognome: [{ value: user.cognome, disabled: true }],
        email: [{ value: user.email, disabled: true }],
        whatsapp: [{ value: user.whatsapp, disabled: true }],
      });
    });
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
    } else {
      this.profileForm.get('username')?.disable();
      this.profileForm.get('password')?.disable();
      this.profileForm.get('nome')?.disable();
      this.profileForm.get('cognome')?.disable();
      this.profileForm.get('email')?.disable();
      this.profileForm.get('whatsapp')?.disable();
    }
  }

  saveProfile() {
    if (!this.profileForm.valid || !this.user?.id) {
      alert('Compila tutti i campi correttamente.');
      return;
    }

    this.usernameError = null;
    this.emailError = null;

    const updatedUser = this.profileForm.value;
    console.log('Dati aggiornati:', updatedUser);

    this.studentService.updateProfile(updatedUser, this.user.id).subscribe({
      next: (response) => {
        console.log('Profilo aggiornato con successo!', response);
        alert('Profilo aggiornato!');

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

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  update() {
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

    this.isUpdate = true;
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
