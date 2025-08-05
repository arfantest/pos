import { bootstrapApplication } from "@angular/platform-browser"
import { importProvidersFrom } from "@angular/core"
import { BrowserAnimationsModule } from "@angular/platform-browser/animations"
import { HttpClientModule } from "@angular/common/http"
import { RouterModule } from "@angular/router"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { routes } from "./app/app.routes"
import { provideHttpClient, withInterceptors } from "@angular/common/http"
import { AppComponent } from "./app/app"
import { authInterceptor } from "./app/core/interceptors/auth.interceptor"
import { appConfig } from "./app/app.config"

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    importProvidersFrom(
      BrowserAnimationsModule,
      HttpClientModule,
      RouterModule.forRoot(routes),
      FormsModule,
      ReactiveFormsModule,
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
}).catch((err) => console.error(err))
