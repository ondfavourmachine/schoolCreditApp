import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
// import { ChatBotComponent } from "src/app/components/chat-bot/chat-bot.component";
// import { ChatInputComponent } from "src/app/components/chat-input/chat-input.component";
// import { ChatMessagesDisplayComponent } from "src/app/components/chat-messages-display/chat-messages-display.component";
import { SharedModule } from "../shared/shared.module";

// const chatBotRoute: Routes = [{ path: "", component: ChatBotComponent }];

@NgModule({
  declarations: [
    // ChatBotComponent,
    // ChatInputComponent,
    // ChatMessagesDisplayComponent
  ],
  // RouterModule.forChild(chatBotRoute)
  imports: [CommonModule, SharedModule],
  exports: [RouterModule]
})
export class ChatbotModule {}
