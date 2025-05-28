import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { RouterModule } from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';
import { ServerErrorComponent } from './server-error/server-error.component';
import {ToastrModule} from 'ngx-toastr';
import { BreadcrumbComponent, BreadcrumbItemDirective } from 'xng-breadcrumb';
import { SectionHeaderComponent } from './section-header/section-header.component';
import { SharedModule } from '../shared/shared.module';
import { ContactComponent } from './contact/contact.component';



@NgModule({
  declarations: [NavBarComponent, NotFoundComponent, ServerErrorComponent, SectionHeaderComponent, ContactComponent],
  imports: [
    CommonModule, RouterModule, BreadcrumbComponent, BreadcrumbItemDirective,SharedModule, ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
      preventDuplicates: true
    })
  ],
  exports: [NavBarComponent, SectionHeaderComponent]
})
export class CoreModule { }
