import { Message, TopicMessages } from 'kafkajs';

export interface IProducer {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  send: (message: Message[]) => Promise<void>;
  // batchSend: (topicMessages: TopicMessages[]) => Promise<void>;
}
