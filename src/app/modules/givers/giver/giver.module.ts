import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GiverComponentComponent } from '../../../components/giver-component/giver-component.component'
import { SharedModule } from '../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

const chatBotGiverRoute: Routes = [
  { path: "", component: GiverComponentComponent }
];

@NgModule({
  declarations: [
    GiverComponentComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(chatBotGiverRoute)
  ]
})
export class GiverModule { }
