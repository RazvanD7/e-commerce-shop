import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-paging-header',
  standalone: false,
  templateUrl: './paging-header.component.html',
  styleUrl: './paging-header.component.scss'
})
export class PagingHeaderComponent implements OnInit {
@Input() pageNumber: number;
@Input() pageSize: number;
@Input() totalCount: number;

constructor() {}

ngOnInit(): void {
  
}
}
