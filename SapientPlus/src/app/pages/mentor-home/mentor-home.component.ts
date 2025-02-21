import { Component, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AvatarService } from '../../services/avatar.service';
import { MentorService } from '../../services/mentor.service';
import { iMentor } from '../../interfaces/i-mentor';
import { iMateria } from '../../interfaces/i-materia';
import { take } from 'rxjs';
import { MateriaService } from '../../services/materia.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-mentor-home',
  templateUrl: './mentor-home.component.html',
  styleUrl: './mentor-home.component.scss',
})
export class MentorHomeComponent {
  user!: iMentor;
  profileForm!: FormGroup;
  isEditing: boolean = false;
  isUpdate: boolean = true;
  usernameError: string | null = null;
  isAvatarUploading: boolean = false;
  emailError: string | null = null;
  materieDisponibili: iMateria[] = [];

  selectedFile?: File;
  selectedAvatarPreview?: string;

  private stompClient: any;
  notifications: any = [];
  unreadCount: number = 0;
  isMateriaCustom: boolean = false;
  livelliMaterie: string[] = ['base', 'intermedio', 'avanzato'];
  isDarkMode!: boolean;

  @ViewChild('sidenavContainer') sidenavContainer!: ElementRef;

  constructor(
    private authService: AuthService,
    private avatarService: AvatarService,
    private fb: FormBuilder,
    private router: Router,
    private mentorService: MentorService,
    private materiaService: MateriaService,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.isDarkMode = this.cookieService.get('darkMode') === 'true';
    this.authService.user$.pipe(take(1)).subscribe((user) => {
      if (!user || !user.id || !user.username) {
        console.error('Nessun utente autenticato!');
        return;
      }

      this.mentorService.getUpdatedMentor(user.username).subscribe({
        next: (mentor) => {
          this.user = mentor;
          this.authService.updateMentor(mentor);

          this.connectWebSocket();
          this.loadNotifications();

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

              this.materieDisponibili = [...materieBase, ...data].reduce(
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

              this.initForm(mentor);
            },
            error: (err) => {
              console.error('Errore nel recupero materie:', err);
              this.materieDisponibili = [];
              this.initForm(mentor);
            },
          });
        },
        error: (err) => {
          console.error('Errore nel recupero dati aggiornati:', err);
        },
      });
    });
  }

  openWhatsApp(whatsapp: string, nome: String) {
    if (!whatsapp) {
      alert('Numero WhatsApp non disponibile');
      return;
    }
    const url = `https://wa.me/${whatsapp}?text=Ciao%20${nome},%20sei%20interessato%20alle%20mie%20lezioni?`;
    window.open(url, '_blank');
  }

  loadNotifications() {
    if (!this.user?.id) return;

    this.mentorService.getMentorNotifications(this.user.id).subscribe({
      next: (notifications) => {
        this.notifications = notifications.map((n: any) => ({
          id: n.id,
          content: n.content,
          read: n.read,
          whatsapp: n.whatsapp,
        }));

        this.updateUnreadCount();

        if (this.notifications.some((n: any) => !n.read)) {
          this.mentorService
            .markNotificationsAsRead(this.user.id)
            .subscribe(() => {
              this.notifications.forEach((n: any) => (n.read = true));
              this.updateUnreadCount();
            });
        }
      },
      error: (error) => {
        console.error('Errore nel caricamento delle notifiche:', error);
      },
    });
  }

  initForm(mentor: iMentor) {
    this.profileForm = this.fb.group({
      username: [{ value: mentor.username, disabled: true }],
      password: [{ value: mentor.password, disabled: true }],
      nome: [{ value: mentor.nome, disabled: true }],
      cognome: [{ value: mentor.cognome, disabled: true }],
      email: [{ value: mentor.email, disabled: true }],
      whatsapp: [{ value: mentor.whatsapp, disabled: true }],
      fasciaOrariaInizio: [
        { value: mentor.fasciaOrariaInizio, disabled: true },
        [Validators.required],
      ],
      fasciaOrariaFine: [
        { value: mentor.fasciaOrariaFine, disabled: true },
        [Validators.required],
      ],
      materie: this.fb.array(mentor.materie.map((m) => this.fb.group(m)) || []),
      materiaCustomName: [''],
      materiaCustomLevel: [''],
    });
  }

  connectWebSocket() {
    const socket = new WebSocket('ws://localhost:8080/ws');

    socket.onopen = () => {
      if (!this.user || !this.user.id) {
        console.error('❌ Errore: Mentor ID non definito!');
        return;
      }

      const subscribeMessage = JSON.stringify({
        type: 'subscribe',
        mentorId: this.user.id,
      });

      socket.send(subscribeMessage);
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === 'notification') {
          this.notifications.unshift({
            id: message.id,
            content: message.content,
            read: false,
          });
          this.updateUnreadCount();
        }
      } catch (error) {
        console.error('Errore nel parsing del messaggio WebSocket:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('Errore WebSocket:', error);
    };

    socket.onclose = () => {
      console.warn(' WebSocket disconnesso.');
    };

    this.stompClient = socket;
  }

  updateUnreadCount() {
    this.unreadCount = this.notifications.filter((n: any) => !n.read).length;
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    Object.keys(this.profileForm.controls).forEach((field) => {
      const control = this.profileForm.get(field);
      if (control) {
        this.isEditing ? control.enable() : control.disable();
      }
    });
  }

  markNotificationsAsRead() {
    this.notifications.forEach((n: any) => (n.read = true));
    this.unreadCount = 0;
  }

  saveProfile() {
    if (!this.profileForm.valid || !this.user?.id) {
      alert('Compila tutti i campi correttamente.');
      return;
    }

    this.usernameError = null;
    this.emailError = null;

    const updatedUser = this.profileForm.value;

    this.mentorService.updateProfile(updatedUser, this.user.id).subscribe({
      next: (response) => {
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

    this.isAvatarUploading = true;
  }

  get materieFormArray() {
    return this.profileForm.get('materie') as FormArray;
  }

  addMateria(materia: any) {
    if (!materia || !materia.nome || !materia.livello) {
      console.warn('Materia non valida:', materia);
      return;
    }

    const materieArray = this.materieFormArray;

    if (
      !materieArray.value.some(
        (m: any) => m.nome.toLowerCase() === materia.nome.toLowerCase()
      )
    ) {
      materieArray.push(this.fb.control(materia));
    }
  }

  confermaMateriaPersonalizzata() {
    const nomeMateria = this.profileForm
      .get('materiaCustomName')
      ?.value?.trim()
      .toLowerCase();
    const livelloMateria = this.profileForm
      .get('materiaCustomLevel')
      ?.value?.trim()
      .toLowerCase();

    if (!nomeMateria || !livelloMateria) {
      console.warn(
        'Nome e livello della materia personalizzata sono obbligatori.'
      );
      return;
    }

    const newMateria: iMateria = {
      nome: nomeMateria.toLowerCase(),
      livello: livelloMateria.toLowerCase(),
    };

    const esiste = this.materieFormArray.controls.some(
      (control) =>
        control.value.nome.toLowerCase() === newMateria.nome.toLowerCase() &&
        control.value.livello.toLowerCase() === newMateria.livello.toLowerCase()
    );

    if (!esiste) {
      this.materieFormArray.push(this.fb.group(newMateria));
    } else {
      console.warn('Questa materia è già stata selezionata.');
    }

    this.profileForm.patchValue({
      materiaCustomName: '',
      materiaCustomLevel: '',
    });

    this.isMateriaCustom = false;
    this.profileForm.patchValue({
      materiaCustomName: '',
      materiaCustomLevel: '',
    });
  }

  removeMateria(index: number) {
    this.materieFormArray.removeAt(index);
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
        alert('Avatar aggiornato!');
      },
      error: (err) => {
        console.error("Errore durante il caricamento dell'avatar:", err);
        alert("Errore durante il caricamento dell'avatar");
      },
    });
    this.selectedAvatarPreview = undefined;
    this.selectedFile = undefined;
  }

  cancelSelection() {
    this.selectedFile = undefined;
    this.selectedAvatarPreview = undefined;
  }
}
