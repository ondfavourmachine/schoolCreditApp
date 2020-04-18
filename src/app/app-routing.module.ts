import { NgModule, Component } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

const routes: Routes = [
  {
    path: "",
    redirectTo: "receiver",
    pathMatch: "full"
  },

  {
    path: "chatbot",
    loadChildren: () =>
      import("./modules/chatbot/chatbot.module").then(m => m.ChatbotModule)
  },

  {
    path: "receiver",
    loadChildren: () =>
      import("./modules/receiver/receiver.module").then(m => m.ReceiverModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
