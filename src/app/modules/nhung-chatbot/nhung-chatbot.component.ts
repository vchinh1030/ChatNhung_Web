import { Component, ElementRef, ViewChild } from '@angular/core';
import { CauHoiLoiModel, ChatBotModel, LichSuChatModel, Message } from './models/Message';
import { ChatService } from './chat.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { first, take, timestamp } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { IndexeddbService } from './indexeddb.service';

@Component({
  selector: 'app-nhung-chatbot',
  templateUrl: './nhung-chatbot.component.html',
  styleUrls: ['./nhung-chatbot.component.scss']
})
export class NhungChatbotComponent {
  constructor(private service: ChatService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private cookieService: CookieService,
    private dbService: IndexeddbService
  ) { }
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  danhgia: string = '';
  open_dropdown_chathistory: boolean = false;
  textAreaHeight: string = 'auto';
  textAreaHeightDialog: string = 'auto';
  loading: boolean = false;
  isIntroduct: boolean = false;
  isPaused: boolean = false;
  objChatBot: ChatBotModel = new ChatBotModel();
  objChatBotMes: Message = new Message();
  objCauHoiLoi: CauHoiLoiModel = new CauHoiLoiModel();
  objLichSuChat: LichSuChatModel = new LichSuChatModel();
  display: boolean = false;
  display_content: boolean = false;
  display_chitiet_lschatbot: boolean = false;
  tenPhongBan: string = '';
  intervalId: any;
  listChatBotUser: ChatBotModel[] = []
  mes: any[] = []
  chat_id: string = '';
  id_mess: number = 0;

  ngOnInit(): void {
    const storedIdChat = this.cookieService.get('id_chat');
    this.objChatBot.chat_id = storedIdChat;
    this.dbService.getByKey('Chats', storedIdChat).then(existingChat => {
      if (existingChat) {
        this.isIntroduct = true
        this.mes = existingChat.messages.map((item: any) => ({
          ...item,
          question: item.sender === 'user' ? item.content : undefined,
          answer: item.sender === 'bot' ? item.content : undefined,
          author: item.sender,
          dateReceive: item.timestamp
        }));
        this.dbService.processMessages(this.mes, storedIdChat);
        this.chat_id = storedIdChat;
        this.display_chitiet_lschatbot = true;
      }
      else {
        if (this.objChatBot.chat_id !== '') {
          this.service.ChiTiet_LsChatBot(storedIdChat).pipe(first()).subscribe(data => {
            this.isIntroduct = true
            this.mes = data.histories.map((history: any) => {
              if (history.sender === 'user') {
                return {
                  ...history,
                  question: history.content,
                  author: history.sender,
                  dateReceive: history.timestamp
                }
              }
              if (history.sender === 'bot') {
                return {
                  ...history,
                  answer: history.content,
                  author: history.sender,
                  dateReceive: history.timestamp
                }
              }
            },
            );
            this.dbService.processMessages(this.mes, storedIdChat);

            this.chat_id = storedIdChat;
            this.display_chitiet_lschatbot = true;
            console.log(this.mes)
            this.scrollToBottom();
          })
        }
      }
    })
  }
  scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll failed', err);
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  btnPause() {
    this.isPaused = true;
    this.loading = false;
    this.mes = this.mes.filter(item => item.answer !== 'Loading.....');
    this.objChatBotMes.answer = ''
  }

  sendMes() {
    if(!this.objChatBot.question.trim()) {
      this.loading = false;
      return
    }
    this.loading = true;
    this.isIntroduct = true;
    let objUserSend = {
      chatbot: 'CA504D2F-4C22-4ACF-9258-CA0104A1A71C',
      question: this.objChatBot.question,
      chat_id: this.objChatBot.chat_id
    }
      this.mes.push({
        chatbot: this.objChatBot.chatbot,
        question: this.objChatBot.question,
        dateReceive: new Date(),
        author: "user"
      })
      this.mes.push({
        status: 0,
        answer: 'Loading.....',
        dateReceive: new Date(),
        author: "bot"
      })
    this.service.QA_ChatBot(objUserSend).pipe(take(1)).subscribe(data => {
      if (data.status === 'success') {
        let tempAnswer = '';
        this.isPaused = false;
        const fullAnswer = data.answer;
        let currentIndex = 0;
        const botMessage = {
          status: data.status,
          answer: '',
          context: data.context,
          dateReceive: new Date(),
          author: 'bot'
        };
        this.mes = this.mes.filter(item => item.answer !== 'Loading.....')
        this.mes.push(botMessage);
        this.intervalId = setInterval(() => {
          if (this.isPaused) {
            clearInterval(this.intervalId);
            this.loading = false;
            return;
          }
          if (currentIndex < fullAnswer.length) {
            tempAnswer += fullAnswer[currentIndex];
            currentIndex++;
            botMessage.answer = tempAnswer;
          }
          else {
            clearInterval(this.intervalId);
            this.objChatBotMes.answer = botMessage.answer
            this.objCauHoiLoi.CauHoi = objUserSend.question
            this.objChatBot.chat_id = data.chat_id
            //thêm chat vào indexedDB
            const newMessages = [
              {
                content: objUserSend.question,
                sender: 'user',
                timestamp: new Date().toISOString(),
              },
              {
                content: botMessage.answer,
                sender: botMessage.author,
                timestamp: new Date().toISOString(),
              },
            ];

            this.dbService.processMessages(newMessages, data.chat_id)
              .then(() => {
                console.log('Tin nhắn đã được thêm thành công!');
              })
              .catch(error => {
                console.error('Lỗi khi thêm tin nhắn:', error);
              });
            this.loading = false;
          }
        }, 15)
        const expirationDate = new Date();
        expirationDate.setMinutes(expirationDate.getMinutes() + 60);
        let currentChatId = this.cookieService.get('id_chat');
        if (!currentChatId) {
          currentChatId = data.chat_id;
          this.cookieService.set('id_chat', currentChatId, expirationDate);
        }
        else {
          console.log('Chat ID tồn tại, không tạo mới:', currentChatId);
        }
      }
      else {
        this.mes = this.mes.filter(item => item.answer !== 'Loading.....')
        this.mes.push({
          status: data.status,
          answer: 'Hệ thống đang lỗi, vui lòng thử lại sau !!',
          dateReceive: new Date(),
          author: "bot"
        })
        this.loading = false;
      }
    })
    this.objChatBot.question = '';
    this.setTextareaHeight();
  }
  showDialogDanhGiaLoi() {
    this.display = true
  }
  closeDialogDanhGia() {
    this.display = false;
    this.setTextareaHeightDialog();
  }
  guiCauHoiLoi() {
    console.log('ffff ', this.objChatBot.question)
    let obj = {
      Id_ChatBot: this.objChatBot.chatbot,
      CauHoi: this.objCauHoiLoi.CauHoi,
      CauTraLoiCuaAI: this.objChatBotMes.answer,
      MoTaLoi: this.objCauHoiLoi.MoTaLoi
    }
    this.service.BaoCao_Loi(obj).subscribe(data => {
      if (data.flag) {
        this.messageService.add({ key: 'cauhoiloi', severity: 'success', summary: 'Thông báo', detail: data.msg });
        this.display = false;
        this.objCauHoiLoi.MoTaLoi = '';
      }
    })
    this.setTextareaHeightDialog();
  }
  readText() {
    // Lấy nội dung của các phần tử mà bạn muốn đọc (ví dụ, tất cả <p> trên trang)
    let text = "";
    const paragraphs = document.querySelectorAll("div");
    paragraphs.forEach((para) => {
      text += para.innerText + " ";
    });

    // Kiểm tra nếu trình duyệt hỗ trợ Web Speech API
    if ('speechSynthesis' in window) {
      // Tạo đối tượng SpeechSynthesisUtterance để chứa văn bản cần đọc
      const speech = new SpeechSynthesisUtterance();
      speech.text = text;
      speech.lang = 'vi-VN';  // Thiết lập ngôn ngữ tiếng Việt
      speech.rate = 1;        // Tốc độ đọc (có thể điều chỉnh)
      // Phát âm thanh
      window.speechSynthesis.speak(speech);
    } else {
      alert("Trình duyệt của bạn không hỗ trợ chức năng này.");
    }
  }
  autoGrow(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    this.textAreaHeight = `${textarea.scrollHeight}px`;
  }
  autoGrowDialog(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    this.textAreaHeightDialog = `${textarea.scrollHeight}px`;
  }
  setTextareaHeight(): void {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(element => {
      if (element instanceof HTMLTextAreaElement) {
        element.style.height = 'initial';
      }
    });
  }
  setTextareaHeightDialog(): void {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(element => {
      if (element instanceof HTMLTextAreaElement) {
        element.style.height = 'auto';
        element.value = '';
      }
    });
  }
}
