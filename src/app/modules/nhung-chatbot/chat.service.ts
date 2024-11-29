import { Injectable } from '@angular/core';
import { map, Observable, Subject, switchMap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CauHoiLoiModel, ChatBotModel, Message } from './models/Message';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private userMessages = new Subject<ChatBotModel>();
  constructor(private http: HttpClient) { }

  QA_ChatBot(objChatBot: ChatBotModel) {
    let obj = {
      chatbot: objChatBot.chatbot,
      question: objChatBot.question,
      chat_id: objChatBot.chat_id
    };
    return this.http.post<any>(
      `http://118.70.171.240:9082/chat_bot/search-embed`,
      obj
    );
  }
  BaoCao_Loi(objCauHoiLoi: CauHoiLoiModel) {
    let obj = {
      Id_ChatBot: objCauHoiLoi.Id_ChatBot,
      CauHoi: objCauHoiLoi.CauHoi,
      CauTraLoiCuaAI: objCauHoiLoi.CauTraLoiCuaAI,
      MoTaLoi: objCauHoiLoi.MoTaLoi,
    };
    return this.http.post<any>(
      `http://10.100.1.3:8797/api/quanly_cauhoiloi/insert_cauhoiloi`,
      obj
    );
  }
  LichSuChatBot(id: string) {
    return this.http.get<any>(
      `${environment.apiBaseUrl}api/quanly_lichsuchatbot/get_messages_ById_chats?id=${id}`
    );
  }
  ChiTiet_LsChatBot(chat_id: string) {
    const headers = new HttpHeaders({
        'Content-Type': 'application/json'
    });
    return this.http.post<any>(`http://118.70.171.240:9082/chat_bot/chat-history?chat_id=${chat_id}`, {}, { headers: headers });
}
  public submitMessage(userMessage: ChatBotModel): void {
    this.userMessages.next(userMessage);
  }

  public get botResponse$(): Observable<Message> {
    return this.userMessages.pipe(
      switchMap((userMessage) => {
        const chatBotModel: ChatBotModel = {
          chatbot: userMessage.chatbot,
          question: userMessage.question,
          chat_id: userMessage.chat_id
        };
        return this.QA_ChatBot(chatBotModel).pipe(
          map((response) => {
            return {
              status: response.status,
              answer: response.answer,
              context: response.context,
            } as Message;
          })
        );
      })
    );
  }
}
