import { NgModule, Component } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

const routes: Routes = [
  {
    path: "",
    redirectTo: "school",
    pathMatch: "full"
  },

  {
    path: "chatbot",
    loadChildren: () =>
      import("./modules/chatbot/chatbot.module").then(m => m.ChatbotModule)
  },

  // {
  //   path: "receiver",
  //   loadChildren: () =>
  //     import("./modules/receiver/receiver.module").then(m => m.ReceiverModule)
  // },

  {
    path: "school",
    loadChildren: () =>
      import("./modules/givers/giver/giver.module").then(m => m.GiverModule)
  },
  {
    path: "school/:name",
    loadChildren: () =>
      import("./modules/givers/giver/giver.module").then(m => m.GiverModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
