import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  linkedInUrl = 'https://www.linkedin.com/in/mahendran-krishnan-9b6964a/'; //  my LinkedIn URL
  githubUrl = 'https://github.com/mahendrankrishnan'; //  my GitHub URL
}

