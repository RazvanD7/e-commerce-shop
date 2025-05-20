import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { response } from 'express';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Shop';

  constructor(private http: HttpClient){}

  ngOnInit(): void {
    this.http.get('https://localhost:5202/api/products').subscribe((response: any) => {
      console.log(response);
    }, error => {
      console.log(error);
    })
  }
} 