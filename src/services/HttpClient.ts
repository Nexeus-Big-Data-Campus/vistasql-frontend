import { HttpOptions, ResponseError } from "../interfaces/http";


export class HttpClient {

    async makeRequest<T>(url: string, method: string, opts?: HttpOptions): Promise<T | ResponseError> {
        const response = await fetch(url, {
            method,
            headers: opts?.headers,
            body: opts?.body,
        });

        if (!response.ok) {
            return {
                error: true,
                status: response.status
            }
        }

        return (await response.json()) as T;
    }
}