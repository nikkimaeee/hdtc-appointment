import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { PrimeNgModule } from './primeng.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AdminLayoutComponent } from './layout/layout.component';
import { MenuitemComponent } from './layout/menuitem/menuitem.component';
import { MenuComponent } from './layout/menu/menu.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { TableComponent } from './component/table/table.component';
import { NavbarComponent } from './navbar/navbar.component';
import { TopbarComponent } from './layout/topbar/topbar.component';

@NgModule({
  declarations: [
    MenuitemComponent,
    MenuComponent,
    SidebarComponent,
    AdminLayoutComponent,
    TableComponent,
    NavbarComponent,
    TopbarComponent,
  ],
  imports: [
    BrowserModule,
    PrimeNgModule,
    RouterModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    RouterModule,
    FontAwesomeModule,
  ],
  providers: [],
  exports: [
    ReactiveFormsModule,
    FontAwesomeModule,
    PrimeNgModule,
    AdminLayoutComponent,
    MenuComponent,
    MenuitemComponent,
    TableComponent,
    NavbarComponent,
    TopbarComponent,
  ],
})
export class SharedModule {}
