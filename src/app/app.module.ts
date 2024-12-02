import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ChatService } from './modules/nhung-chatbot/chat.service';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { NotfoundComponent } from './modules/notfound/notfound.component';
import { NhungChatbotComponent } from './modules/nhung-chatbot/nhung-chatbot.component';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { NgxIndexedDBModule, DBConfig } from 'ngx-indexed-db';
import { LinebreakPipe } from './modules/_core/linebreak.pipe';
const dbConfig: DBConfig = {
  name: 'QuanLy_LichSuChatBot',
  version: 2, // Tăng phiên bản nếu cần cập nhật cấu trúc
  objectStoresMeta: [
    {
      store: 'Chats',
      storeConfig: { keyPath: '_id', autoIncrement: true },
      storeSchema: [
        { name: 'chat_name', keypath: 'chat_name', options: { unique: false } },
        { name: 'messages', keypath: 'messages', options: { unique: false } },
      ],
    },
  ],
};
@NgModule({
  declarations: [
    AppComponent,
    NotfoundComponent,
    NhungChatbotComponent,
    LinebreakPipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ButtonModule,
    DropdownModule,
    FormsModule,
    HttpClientModule,
    DialogModule,
    ToastModule,
    AppRoutingModule,
    NgxIndexedDBModule.forRoot(dbConfig)
  ],
  providers: [
    MessageService, ConfirmationService, ChatService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
