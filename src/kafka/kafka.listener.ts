import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class KafkaEventListeners {
  private readonly logger = new Logger(KafkaEventListeners.name);

  private getNowTime(): string {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const millisStr = String(now.getMilliseconds()).padStart(3, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${millisStr}`;
  }

  @OnEvent('kafka.message.received')
  handleMessageReceivedEvent(payload: any) {
    this.logger.log(`이벤트 감지: 새 Kafka 메시지 수신됨`);
    //this.logger.log(`주문 데이터: ${JSON.stringify(payload.payload)}`);
    //this.logger.log(`메타데이터: ${JSON.stringify(payload.metadata)}`);
    this.logger.log(
      `송신 시간: ${JSON.stringify(payload.payload.payload.orderDate)}`,
    );
    this.logger.log(`수신 시간:` + this.getNowTime());

    // 여기에 추가 처리 로직 구현
    // 예: DB에 로그 저장, 알림 전송 등
  }

  @OnEvent('kafka.message.error')
  handleMessageErrorEvent(payload: any) {
    this.logger.error(`이벤트 감지: Kafka 메시지 처리 오류`);
    this.logger.error(`오류: ${payload.error}`);
    this.logger.error(`원본 메시지: ${payload.rawMessage}`);
    this.logger.error(`메타데이터: ${JSON.stringify(payload.metadata)}`);

    // 여기에 오류 처리 로직 구현
    // 예: 관리자에게 알림, 오류 로그 저장 등
  }
}
