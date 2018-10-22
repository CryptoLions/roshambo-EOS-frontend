import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { TopComponent } from './pages/top/top.component';
import { MyGamesComponent } from './pages/my-games/my-games.component';
import { CallsComponent } from './pages/calls/calls.component';

export const routes: Routes = [
  { 
  	path: '', 
  	component: HomeComponent, 
  	pathMatch: 'full' 
  },
  { 
    path: 'mygame/:id', 
    component: MyGamesComponent, 
  },
  { 
    path: 'call/:user', 
    component: CallsComponent, 
  },
  { 
  	path: 'top100', 
  	component: TopComponent, 
  },
  { path: '**', redirectTo: '' },
]

export const appRoutingProviders: any[] = [
	//AuthGuard
];

export const appRoutes = RouterModule.forRoot(routes);