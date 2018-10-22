import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';

import { appRoutes } from './main.router';

import { MainService } from './services/main.service';
import { TopComponent } from './pages/top/top.component';

import { FormsModule } from '@angular/forms';
import { MyGamesComponent } from './pages/my-games/my-games.component';
import { CallsComponent } from './pages/calls/calls.component';

import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    TopComponent,
    MyGamesComponent,
    CallsComponent
  ],
  imports: [
    BrowserModule,
    appRoutes,
    FormsModule,
    HttpClientModule
  ],
  providers: [MainService],
  bootstrap: [AppComponent]
})
export class AppModule { }
