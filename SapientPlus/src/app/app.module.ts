import { NgModule } from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
} from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FooterComponent } from './main-components/footer/footer.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { CookieService } from 'ngx-cookie-service';
import {
  HTTP_INTERCEPTORS,
  HttpClientModule,
  provideHttpClient,
  withFetch,
} from '@angular/common/http';
import { DialogComponent } from './atomic-components/dialog/dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { RegisterDialogModule } from './atomic-components/register-dialog/register-dialog.module';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ReviewDialogModule } from './atomic-components/review-dialog/review-dialog.module';

@NgModule({
  declarations: [AppComponent, FooterComponent, DialogComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatTabsModule,
    MatCardModule,
    MatDialogModule,
    RegisterDialogModule,
    HttpClientModule,
    ReviewDialogModule,
  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync(),
    CookieService,
    provideHttpClient(withFetch()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
