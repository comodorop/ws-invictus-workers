export declare class RabbitMQService {
    private channel;
    onModuleInit(): Promise<void>;
    publish(queue: string, message: any): Promise<void>;
}
