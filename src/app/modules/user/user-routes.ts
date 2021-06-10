import { Routes } from "@angular/router";
import { ReceiverParentComponent } from "src/app/receiver-parent/receiver-parent.component";


export const userRoutes: Routes = [
  {
    path: "",
    children: [
      { path: 'questions', component: ReceiverParentComponent },
      { path: 'onboard', component: ReceiverParentComponent}
      // { path: 'agents', component: ReceiverParentComponent }
    ]
  },

  { path: "", redirectTo: "", pathMatch: "full" }
];
