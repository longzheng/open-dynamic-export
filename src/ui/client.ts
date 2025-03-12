// https://kubb.dev/plugins/swagger-client/client#default-client-with-declare-const
import {
    type AxiosError,
    type AxiosHeaders,
    type AxiosRequestConfig,
} from 'axios';

import axios from 'axios';

const AXIOS_BASE: string = `${import.meta.env.VITE_API_URL_BASE}`;

declare const AXIOS_HEADERS: string;

export type RequestConfig<TVariables = unknown> = {
    method: 'get' | 'put' | 'patch' | 'post' | 'delete';
    url: string;
    params?: unknown;
    data?: TVariables;
    responseType?:
        | 'arraybuffer'
        | 'blob'
        | 'document'
        | 'json'
        | 'text'
        | 'stream';
    signal?: AbortSignal;
    headers?: AxiosRequestConfig['headers'];
};

export const axiosInstance = axios.create({
    baseURL: typeof AXIOS_BASE !== 'undefined' ? AXIOS_BASE : undefined,
    headers:
        typeof AXIOS_HEADERS !== 'undefined'
            ? (JSON.parse(AXIOS_HEADERS) as AxiosHeaders)
            : undefined,
});

export const axiosClient = async <
    TData,
    TError = unknown,
    TVariables = unknown,
>(
    config: RequestConfig<TVariables>,
): Promise<TData> => {
    const promise = axiosInstance
        .request<TData>({ ...config })
        .then(({ data }) => data)
        .catch((e: AxiosError<TError>) => {
            throw e;
        });

    return promise;
};

export default axiosClient;
