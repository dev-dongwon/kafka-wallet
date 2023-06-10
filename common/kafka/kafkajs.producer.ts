import { Logger } from '@nestjs/common';
import { Kafka, Message, Producer, TopicMessages } from 'kafkajs';
import { IProducer } from './producer.interface';

export interface BatchMessages {
  topic: string;
  message: Message;
}

export class KafkajsProducer {
  private readonly kafka: Kafka;
  private readonly producer: Producer;
  private readonly logger: Logger;

  constructor(private readonly topic: string, broker: string) {
    this.kafka = new Kafka({
      brokers: [broker],
    });
    this.producer = this.kafka.producer();
    this.logger = new Logger();
  }

  async send(messages: Message[]) {
    await this.producer.send({ topic: this.topic, messages });
  }

  async sendBatch(topicMessages: TopicMessages[]) {
    await this.producer.sendBatch({ topicMessages });
  }

  async connect() {
    try {
      await this.producer.connect();
    } catch (err) {
      this.logger.error('Failed to connect to Kafka.', err);
      await this.connect();
    }
  }

  async disconnect() {
    await this.producer.disconnect();
  }
}
