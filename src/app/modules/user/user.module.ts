import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { UserRoutingModule } from './user-routing.module';
import { ChatBotComponent } from "src/app/components/chat-bot/chat-bot.component";
import { ChatMessagesDisplayComponent } from "src/app/components/chat-messages-display/chat-messages-display.component";
import { ReceiverParentComponent } from "src/app/receiver-parent/receiver-parent.component";
import { SharedModule } from "../shared/shared.module";

@NgModule({
  declarations: [ReceiverParentComponent],
  imports: [CommonModule, SharedModule, UserRoutingModule],

  // exports: [ DashboardComponent]
})
export class UserModule {}
