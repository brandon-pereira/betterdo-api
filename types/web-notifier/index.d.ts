declare module 'web-notifier' {
    interface Notifier {
        schedule(Date, String, any): Promise<null>;
        send(ObjectId, any): Promise<null>;
    }
    class WebNotifier {
        // eslint-disable-next-line @typescript-eslint/no-misused-new
        constructor(...args: any[]): WebNotifier;
        schedule(Date, String, any): Promise<null>;
        send(ObjectId, any): Promise<null>;
    }

    class MongoAdapter {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        constructor(...args: any[]): MongoAdapter;
    }
}
