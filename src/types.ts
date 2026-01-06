export interface Report {
    id: number;
    topic: string;
    content: string;
    sources: any;
    created_at: string | Date; // Date from DB, string from JSON API
}
