import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HeaderComponent } from "src/app/components/header/header.component";
import { FooterComponent } from "src/app/components/footer/footer.component";
import { ChatBotComponent } from "../../components/chat-bot/chat-bot.component";
import { ChatInputComponent } from "../../components/chat-input/chat-input.component";
import { ChatMessagesDisplayComponent } from "../../components/chat-messages-display/chat-messages-display.component";
// import { NzDropDownModule } from "ng-zorro-antd/dropdown";

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    ChatBotComponent,
    ChatInputComponent,
    ChatMessagesDisplayComponent
  ],
  imports: [
    CommonModule
    // NzDropDownModule
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    ChatBotComponent,
    ChatInputComponent,
    ChatMessagesDisplayComponent
  ]
})
export class SharedModule {}
