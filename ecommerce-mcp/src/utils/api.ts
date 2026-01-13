import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { API_CONFIG, ERROR_MESSAGES } from "../config/constants";
import { APIResponse, MCPToolResponse } from "../types";

/**
 * API Client for backend communication
 */
export class BackendAPI {
  private baseURL: string;
  private defaultTimeout: number;

  constructor(baseURL?: string, timeout?: number) {
    this.baseURL = baseURL || API_CONFIG.BACKEND_URL;
    this.defaultTimeout = timeout || API_CONFIG.DEFAULT_TIMEOUT;
  }

  /**
   * GET request
   */
  async get<T>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<APIResponse<T>> {
    try {
      const response = await axios.get<APIResponse<T>>(
        `${this.baseURL}${endpoint}`,
        {
          timeout: this.defaultTimeout,
          headers: {
            "Content-Type": "application/json",
            ...config?.headers,
          },
          ...config,
        }
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<APIResponse<T>> {
    try {
      const response = await axios.post<APIResponse<T>>(
        `${this.baseURL}${endpoint}`,
        data,
        {
          timeout: this.defaultTimeout,
          headers: {
            "Content-Type": "application/json",
            ...config?.headers,
          },
          ...config,
        }
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<APIResponse<T>> {
    try {
      const response = await axios.put<APIResponse<T>>(
        `${this.baseURL}${endpoint}`,
        data,
        {
          timeout: this.defaultTimeout,
          headers: {
            "Content-Type": "application/json",
            ...config?.headers,
          },
          ...config,
        }
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * DELETE request
   */
  async delete<T>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<APIResponse<T>> {
    try {
      const response = await axios.delete<APIResponse<T>>(
        `${this.baseURL}${endpoint}`,
        {
          timeout: this.defaultTimeout,
          headers: {
            "Content-Type": "application/json",
            ...config?.headers,
          },
          ...config,
        }
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle and format errors
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;

      if (axiosError.response) {
        // Server responded with error
        const status = axiosError.response.status;
        const data = axiosError.response.data;

        return new Error(`API Error ${status}: ${JSON.stringify(data)}`);
      } else if (axiosError.request) {
        // Request made but no response
        return new Error(
          `${ERROR_MESSAGES.NETWORK_ERROR}: ${axiosError.message}`
        );
      }
    }

    // Unknown error
    return new Error(error.message || ERROR_MESSAGES.UNKNOWN_ERROR);
  }
}

/**
 * Format MCP Tool Response (Success)
 */
export function formatSuccessResponse<T>(data: T): MCPToolResponse {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data, null, 2),
      },
    ],
    structuredContent: data,
  };
}

/**
 * Format MCP Tool Response (Error)
 */
export function formatErrorResponse(errorMessage: string): MCPToolResponse {
  console.error(`[MCP Error] ${errorMessage}`);

  return {
    content: [
      {
        type: "text",
        text: errorMessage,
      },
    ],
    isError: true,
  };
}

/**
 * Create singleton API client
 */
export const apiClient = new BackendAPI();
