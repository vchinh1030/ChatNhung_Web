import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';

@Injectable({
  providedIn: 'root'
})
export class IndexeddbService {

  constructor(private dbService: NgxIndexedDBService) { }
    // Kiểm tra và khởi tạo cơ sở dữ liệu
    initializeDB(): void {
      console.log('Checking if database is initialized...');
      this.dbService.getAll('Chats').subscribe({
        next: (data) => {
          console.log('Database already exists with data:', data);
        },
        error: () => {
          console.log('Database not found. Initializing...');
          // this.createSampleData();
        },
      });
    }
      // Thêm một cuộc trò chuyện mới
  addChat(chat: any): Promise<any> {
    return this.dbService.add('Chats', chat).toPromise();
  }
      // Thêm tin nhắn vào một cuộc trò chuyện
  async addMessageToChat(chatId: string, message: any): Promise<void> {
    try {
      // Lấy dữ liệu từ IndexedDB
      const chat = await this.dbService.getByKey('Chats', chatId) as { messages?: any[] };
      if (!chat) {
        console.error('Chat không tồn tại với ID:', chatId);
        throw new Error('Chat not found');
      }

      // Sao chép và thêm tin nhắn mới vào mảng
      chat.messages = [...(chat.messages || []), message];

      // Cập nhật lại IndexedDB
      await this.dbService.update('Chats', chat);
      console.log('Cập nhật thành công!');
    } catch (error) {
      console.error('Lỗi khi thêm tin nhắn:', error);
      throw error;
    }
  }

  async getByKey(storeName: string, key: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const dbName = 'QuanLy_LichSuChatBot';
      const dbVersion = 2;
      const dbRequest = indexedDB.open(dbName, dbVersion); // Mở kết nối đến cơ sở dữ liệu
      dbRequest.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result; // Lấy đối tượng cơ sở dữ liệu
        const tx = db.transaction(storeName, 'readonly'); // Mở giao dịch chỉ đọc
        const store = tx.objectStore(storeName);
        const request = store.get(key); // Lấy bản ghi với khóa chính
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      };
    });
  }
  async processMessages(histories: any[], chat_id: string) {
    const storeName = 'Chats';
    try {
      const request = indexedDB.open('QuanLy_LichSuChatBot');
      request.onsuccess = async (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        // Gom nhóm tin nhắn theo chat_id
        const groupedMessages = histories.reduce((acc: any, item: any) => {
          // const chatId = item.chat_id;
          if (!acc[chat_id]) {
            acc[chat_id] = [];
          }
          acc[chat_id].push({
            sender: item.sender,
            content: item.content,
            timestamp: item.timestamp,
          });
          return acc;
        }, {});
        // Xử lý từng nhóm chat_id
        for (const chat_id of Object.keys(groupedMessages)) {
          const getRequest = store.get(chat_id);
          getRequest.onsuccess = () => {
            const existingChat = getRequest.result;
            if (existingChat) {
              // Nếu đã tồn tại, hợp nhất mà không bị nhân bản
              const existingMessages = existingChat.messages || [];
              const newMessages = groupedMessages[chat_id];
              // Loại bỏ trùng lặp dựa trên content, timestamp
              const mergedMessages = [
                ...existingMessages,
                ...newMessages.filter(
                  (newMsg: any) =>
                    !existingMessages.some(
                      (oldMsg: any) =>
                        oldMsg.timestamp === newMsg.timestamp &&
                        oldMsg.content === newMsg.content
                    )
                ),
              ];
              existingChat.messages = mergedMessages;
              store.put(existingChat);
            } else {
              // Nếu chưa tồn tại, tạo mới
              const newChat = {
                _id: chat_id,
                messages: groupedMessages[chat_id],
              };
              store.add(newChat);
            }
          };
          getRequest.onerror = () => {
            console.error(`Lỗi khi lấy dữ liệu cho chat_id: ${chat_id}`);
          };
        }
        transaction.oncomplete = () => {
          console.log('Dữ liệu đã được xử lý và không bị nhân bản!');
        };
        transaction.onerror = () => {
          console.error('Giao dịch thất bại');
        };
      };
      request.onerror = () => {
        console.error('Không thể mở cơ sở dữ liệu IndexedDB');
      };
    } catch (error) {
      console.error('Lỗi khi xử lý dữ liệu:', error);
    }
  }
}
