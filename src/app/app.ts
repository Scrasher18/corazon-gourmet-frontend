import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: '../styles.css', 
  encapsulation: ViewEncapsulation.None // 
})
export class App {
  title = 'corazon-gourmet-frontend';
}