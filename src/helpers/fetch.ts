export type RetryOptions = {
    retries: number;
    retryCondition?: (error: unknown) => boolean;
};

export type FetchRequestConfig<TBody = unknown> = Omit<
    RequestInit,
    'body' | 'headers'
> & {
    body?: TBody;
    headers?: Record<string, string>;
    url?: string;
    params?: Record<string, string | number | boolean | undefined>;
    retry?: RetryOptions;
    dispatcher?: unknown;
};

export type FetchClientResponse<TData = unknown> = {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: TData;
};

export class FetchHttpError<TData = unknown> extends Error {
    readonly response?: FetchClientResponse<TData>;
    readonly config?: FetchRequestConfig;
    readonly code?: string;
    readonly status?: number;

    constructor({
        message,
        response,
        config,
        code,
    }: {
        message: string;
        response?: FetchClientResponse<TData>;
        config?: FetchRequestConfig;
        code?: string;
    }) {
        super(message);
        this.name = 'FetchHttpError';
        this.response = response;
        this.config = config;
        this.code = code;
        this.status = response?.status;
    }
}

export function buildUrl(
    baseUrl: string,
    link: string,
    params?: FetchRequestConfig['params'],
) {
    const url = new URL(link, baseUrl);

    for (const [key, value] of Object.entries(params ?? {})) {
        if (value !== undefined) {
            url.searchParams.set(key, value.toString());
        }
    }

    return url.toString();
}

export function headersToObject(headers: Headers) {
    return Object.fromEntries(headers.entries());
}

export function isRetryableFetchError(error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
        return false;
    }

    if (error instanceof FetchHttpError) {
        return (
            !error.response ||
            error.response.status === 429 ||
            error.response.status >= 500
        );
    }

    return true;
}

function getRetryDelayMilliseconds(retryCount: number) {
    return 2 ** retryCount * 100;
}

async function parseResponseData(response: Response) {
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
        return response.json();
    }

    return response.text();
}

export async function fetchWithError<TData = unknown, TBody = unknown>(
    url: string,
    config: FetchRequestConfig<TBody> = {},
): Promise<FetchClientResponse<TData>> {
    const { params, retry, body, headers, ...fetchOptions } = config;
    const requestUrl = buildUrl(url, '', params);
    const requestConfig = {
        ...config,
        params,
        url: requestUrl,
    } as FetchRequestConfig;
    const retries = retry?.retries ?? 0;

    for (let attempt = 0; ; attempt++) {
        try {
            const response = await fetch(requestUrl, {
                ...fetchOptions,
                headers,
                body: body as RequestInit['body'],
            });
            const data = (await parseResponseData(response)) as TData;
            const fetchResponse = {
                status: response.status,
                statusText: response.statusText,
                headers: headersToObject(response.headers),
                data,
            };

            if (!response.ok) {
                throw new FetchHttpError({
                    message: `Request failed with status code ${response.status}`,
                    response: fetchResponse,
                    config: requestConfig,
                });
            }

            return fetchResponse;
        } catch (error) {
            const retryCondition =
                retry?.retryCondition ?? isRetryableFetchError;

            if (attempt >= retries || !retryCondition(error)) {
                if (error instanceof FetchHttpError) {
                    throw error;
                }

                throw new FetchHttpError({
                    message:
                        error instanceof Error
                            ? error.message
                            : 'Fetch request failed',
                    config: requestConfig,
                    code: error instanceof Error ? error.name : undefined,
                });
            }

            await new Promise((resolve) => {
                setTimeout(resolve, getRetryDelayMilliseconds(attempt + 1));
            });
        }
    }
}
