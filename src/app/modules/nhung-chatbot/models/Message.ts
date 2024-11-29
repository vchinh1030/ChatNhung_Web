export class ReceiveMessage {
  text: string = '';
  dateReceive!: Date
  author: string = '';
}
export class ChatBotModel {
  chatbot: string = '';
  question: string = '';
  chat_id: string = '';
}
export class Message {
  status: string = '';
  answer: string = '';
  context: string = '';
  chat_id: string = '';
}
export class CauHoiLoiModel {
  Id_ChatBot: string = '';
  CauHoi: string = '';
  CauTraLoiCuaAI: string = '';
  MoTaLoi: string = '';
}
export class LichSuChatModel {
  _id: string = '';
  chat_id: string = '';
  content: string = '';
  sender: string = '';
  timestamp!: Date;
}
