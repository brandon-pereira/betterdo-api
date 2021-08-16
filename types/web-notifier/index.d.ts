declare module 'web-notifier' {
    function schedule(Date, String, any): Promise<null>;
    interface Notifier {
        schedule;
    }
    class WebNotifier {
        constructor(any): Notifier;
    }

    class MongoAdapter {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        constructor(any): any;
    }
}