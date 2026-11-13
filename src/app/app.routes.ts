import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { InstaMergeComponent } from './insta-merge/insta-merge.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Imagix — Creative tools, made simple' },
  { path: 'insta-merge', component: InstaMergeComponent, title: 'InstaMerge — Imagix' },
  { path: '**', redirectTo: '' },
];
