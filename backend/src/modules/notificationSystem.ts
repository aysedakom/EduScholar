export class NotificationSystem {
  async sendNotifications(program: string, distributed: any[]) {
    console.log(`[NotificationSystem] Sending notifications for program: ${program}`);
    for (const record of distributed) {
      console.log(` -> Notification sent to ${record.name} regarding $${record.amount} aid.`);
    }
  }
}
