import { EventEmitter } from "events";

/**
 * 通知データ型
 */
export type NotificationData = {
  id: string;
  type: string;
  title: string;
  content?: string;
  userId: string;
  messageId?: string;
  createdAt: Date;
};

/**
 * 通知イベント用のシングルトンEventEmitter
 * 通知が作成されたときにSSEクライアントに通知を送信するために使用
 */
class NotificationEmitter extends EventEmitter {
  private static instance: NotificationEmitter;

  private constructor() {
    super();
    this.setMaxListeners(100);
  }

  static getInstance(): NotificationEmitter {
    if (!NotificationEmitter.instance) {
      NotificationEmitter.instance = new NotificationEmitter();
    }
    return NotificationEmitter.instance;
  }

  emitNotification(userId: string, notification: NotificationData) {
    this.emit(`notification:${userId}`, notification);
  }

  emitUnreadCount(userId: string, count: number) {
    this.emit(`unread-count:${userId}`, count);
  }
}

export const notificationEmitter = NotificationEmitter.getInstance();
