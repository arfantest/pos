// import { Component, signal } from '@angular/core';
// import { RouterOutlet } from '@angular/router';

// @Component({
//   selector: 'app-root',
//   imports: [RouterOutlet],
//   templateUrl: './app.html',
//   styleUrl: './app.scss'
// })
// export class App {
//   protected readonly title = signal('pos-frontend');
// }

import { Component } from "@angular/core"
import { RouterOutlet } from "@angular/router"

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet],
  template: "<router-outlet></router-outlet>",
})
export class AppComponent {
  title = "pos-angular-frontend"
}
