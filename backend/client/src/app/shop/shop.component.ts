import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IProduct } from '../shared/models/product';
import { ShopService } from './shop.service';
import { IBand } from '../shared/models/band';
import { IType } from '../shared/models/productType';
import { ShopParams } from '../shared/models/shopParams';

@Component({
  selector: 'app-shop',
  standalone: false,
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent implements OnInit {
  @ViewChild('search', {static: false}) searchTerm: ElementRef;
  products: IProduct[];
  bands: IBand[];
  types: IType[];
  shopParams: ShopParams;
  totalCount: number;
  sortOptions = [
    {name: 'Alphabetical', value: 'name'},
    {name: 'Price: Low to High', value:'priceAsc'},
    {name: 'Price: High to Low', value: 'priceDesc'}
  ];

  constructor(private shopService: ShopService){
    this.shopParams = this.shopService.getShopParams();
  }
  ngOnInit(){
   this.getProducts(true);
   this.getBands();
   this.getTypes();
  }

  getProducts(useCache = false)
  {
    this.shopService.getProducts(useCache).subscribe(response => {
      this.products = response.data;
      this.totalCount = response.count;
    }, error => {
      console.log(error);
    });
  }
  getBands()
  {
    this.shopService.getBands().subscribe(response => {
      this.bands = [{id: 0, name: 'All'}, ...response];
    
    }, error => {
      console.log(error);
    });
  }

  getTypes()
  {
    this.shopService.getTypes().subscribe(response => {
      this.types = [{id: 0, name: 'All'}, ...response];
    
    }, error => {
      console.log(error);
    });
  }

  onBandSelected(bandId: number){
    const params = this.shopService.getShopParams();
    params.bandId = bandId;
    params.pageNumber =1;
    this.shopService.setShopParams(params);
    this.getProducts();
  }

  onTypeSelected(typeId: number)
  {
    const params = this.shopService.getShopParams();
    params.typeId = typeId;
     params.pageNumber =1;
     this.shopService.setShopParams(params);
    this.getProducts();
  }

  onSortSelected(sort: string)
  {
    const params = this.shopService.getShopParams();
    params.sort = sort;
     this.shopService.setShopParams(params);
    this.getProducts();
  }

  onPageChange(event: any)
  {
    const params = this.shopService.getShopParams();
    if(params.pageNumber !== event)
    {
     params.pageNumber = event;
     this.shopService.setShopParams(params);
    this.getProducts(true);
    }
  }

  onSearch()
  {
    const params = this.shopService.getShopParams();
    params.search = this.searchTerm.nativeElement.value;
     params.pageNumber =1;
     this.shopService.setShopParams(params);
    this.getProducts();
  }

  onReset(){
    this.searchTerm.nativeElement.value = '';
    this.shopParams = new ShopParams();
    this.shopService.setShopParams(this.shopParams);
    this.getProducts();
  }
}