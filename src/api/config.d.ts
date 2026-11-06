import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'

export declare const API_BASE: string
export declare const getStoredToken: () => string | null
export declare const persistToken: (value: string | null | undefined) => string | null

declare const config: AxiosInstance
export default config
