import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "../shared/shared.module";
import { ReceiverParentComponent } from "src/app/receiver-parent/receiver-parent.component";
import { Routes, RouterModule } from "@angular/router";

const chatBotReceiverRoute: Routes = [
  { path: "", component: ReceiverParentComponent }
];

@NgModule({
  declarations: [ReceiverParentComponent],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(chatBotReceiverRoute)
  ],
  exports: [RouterModule]
})
export class ReceiverModule {}
