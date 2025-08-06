import { bootstrapApplication } from "@angular/platform-browser";
import { importProvidersFrom } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { routes } from "./app/app.routes";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { AppComponent } from "./app/app";
import { authInterceptor } from "./app/core/interceptors/auth.interceptor";
import { appConfig } from "./app/app.config";

// 🔥 i18n for English
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';

registerLocaleData(en); // ⚠️ Make sure this is called before bootstrap

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    importProvidersFrom(
      BrowserAnimationsModule,
      HttpClientModule,
      RouterModule.forRoot(routes),
      FormsModule,
      ReactiveFormsModule
    ),
    provideHttpClient(withInterceptors([authInterceptor])),

    // ✅ Add this here (inside bootstrapApplication)
    { provide: NZ_I18N, useValue: en_US },
  ],
}).catch((err) => console.error(err));
