export enum ErrorCode {
  // 認証関連
  AUTH_FAILED = 'AUTH_FAILED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_REFRESH_FAILED = 'TOKEN_REFRESH_FAILED',
  
  // API関連
  RATE_LIMIT = 'RATE_LIMIT',
  API_ERROR = 'API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  
  // メディア関連
  MEDIA_TOO_LARGE = 'MEDIA_TOO_LARGE',
  MEDIA_INVALID_FORMAT = 'MEDIA_INVALID_FORMAT',
  MEDIA_UPLOAD_FAILED = 'MEDIA_UPLOAD_FAILED',
  
  // プラットフォーム固有
  PLATFORM_MAINTENANCE = 'PLATFORM_MAINTENANCE',
  PLATFORM_ERROR = 'PLATFORM_ERROR',
  
  // その他
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

export interface AppError extends Error {
  code: ErrorCode;
  statusCode?: number;
  platform?: string;
  details?: any;
  isRetryable?: boolean;
  retryAfter?: number;
}

export class ErrorHandler {
  // エラーの分類と詳細情報の抽出
  static classify(error: any, platform?: string): AppError {
    const appError: AppError = {
      name: 'AppError',
      message: error.message || 'Unknown error',
      code: ErrorCode.UNKNOWN_ERROR,
      platform,
      details: error,
      isRetryable: false
    };

    // HTTPステータスコードによる分類
    if (error.response) {
      const status = error.response.status;
      appError.statusCode = status;

      switch (status) {
        case 401:
          appError.code = ErrorCode.TOKEN_EXPIRED;
          appError.isRetryable = true;
          break;
        case 403:
          appError.code = ErrorCode.AUTH_FAILED;
          break;
        case 429:
          appError.code = ErrorCode.RATE_LIMIT;
          appError.isRetryable = true;
          appError.retryAfter = this.extractRetryAfter(error.response);
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          appError.code = ErrorCode.API_ERROR;
          appError.isRetryable = true;
          break;
      }
    }

    // ネットワークエラー
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      appError.code = ErrorCode.NETWORK_ERROR;
      appError.isRetryable = true;
    }

    // タイムアウト
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      appError.code = ErrorCode.TIMEOUT;
      appError.isRetryable = true;
    }

    // プラットフォーム固有のエラー処理
    if (platform) {
      appError.platform = platform;
      this.handlePlatformSpecificError(appError, error);
    }

    return appError;
  }

  // プラットフォーム固有のエラー処理
  private static handlePlatformSpecificError(appError: AppError, originalError: any): void {
    switch (appError.platform) {
      case 'twitter':
        this.handleTwitterError(appError, originalError);
        break;
      case 'instagram':
        this.handleInstagramError(appError, originalError);
        break;
      case 'tiktok':
        this.handleTikTokError(appError, originalError);
        break;
    }
  }

  // Twitterエラーの処理
  private static handleTwitterError(appError: AppError, error: any): void {
    if (error.response?.data?.errors) {
      const twitterError = error.response.data.errors[0];
      
      switch (twitterError.code) {
        case 32:
          appError.code = ErrorCode.AUTH_FAILED;
          appError.message = 'Could not authenticate';
          break;
        case 88:
          appError.code = ErrorCode.RATE_LIMIT;
          appError.isRetryable = true;
          break;
        case 89:
          appError.code = ErrorCode.TOKEN_INVALID;
          appError.message = 'Invalid or expired token';
          break;
        case 130:
          appError.code = ErrorCode.PLATFORM_MAINTENANCE;
          appError.isRetryable = true;
          appError.message = 'Twitter is over capacity';
          break;
      }
    }
  }

  // Instagramエラーの処理
  private static handleInstagramError(appError: AppError, error: any): void {
    if (error.response?.data?.error) {
      const igError = error.response.data.error;
      
      switch (igError.code) {
        case 190:
          appError.code = ErrorCode.TOKEN_EXPIRED;
          appError.message = 'Access token has expired';
          break;
        case 4:
          appError.code = ErrorCode.RATE_LIMIT;
          appError.isRetryable = true;
          break;
        case 24:
          appError.code = ErrorCode.MEDIA_TOO_LARGE;
          appError.message = 'Media file is too large';
          break;
      }
    }
  }

  // TikTokエラーの処理
  private static handleTikTokError(appError: AppError, error: any): void {
    if (error.response?.data?.error) {
      const errorCode = error.response.data.error.code;
      
      switch (errorCode) {
        case 'access_token_invalid':
          appError.code = ErrorCode.TOKEN_INVALID;
          break;
        case 'rate_limit_exceeded':
          appError.code = ErrorCode.RATE_LIMIT;
          appError.isRetryable = true;
          break;
        case 'video_upload_failed':
          appError.code = ErrorCode.MEDIA_UPLOAD_FAILED;
          appError.isRetryable = true;
          break;
      }
    }
  }

  // Retry-Afterヘッダーの抽出
  private static extractRetryAfter(response: any): number {
    const retryAfter = response.headers['retry-after'];
    if (retryAfter) {
      // 秒数として解釈
      const seconds = parseInt(retryAfter);
      if (!isNaN(seconds)) {
        return seconds * 1000;
      }
      // 日付として解釈
      const retryDate = new Date(retryAfter);
      if (!isNaN(retryDate.getTime())) {
        return retryDate.getTime() - Date.now();
      }
    }
    // デフォルト: 1分
    return 60000;
  }

  // エラーログのフォーマット
  static formatErrorLog(error: AppError): string {
    const timestamp = new Date().toISOString();
    const platform = error.platform || 'general';
    const code = error.code;
    const message = error.message;
    const retryable = error.isRetryable ? 'retryable' : 'non-retryable';
    
    return `[${timestamp}] [${platform}] ${code}: ${message} (${retryable})`;
  }

  // ユーザー向けエラーメッセージの生成
  static getUserMessage(error: AppError): string {
    switch (error.code) {
      case ErrorCode.AUTH_FAILED:
        return '認証に失敗しました。再度ログインしてください。';
      case ErrorCode.TOKEN_EXPIRED:
        return 'アクセストークンの有効期限が切れました。再認証が必要です。';
      case ErrorCode.RATE_LIMIT:
        return 'API制限に達しました。しばらく待ってから再試行してください。';
      case ErrorCode.MEDIA_TOO_LARGE:
        return 'メディアファイルが大きすぎます。サイズを縮小してください。';
      case ErrorCode.MEDIA_INVALID_FORMAT:
        return 'サポートされていないメディア形式です。';
      case ErrorCode.NETWORK_ERROR:
        return 'ネットワークエラーが発生しました。接続を確認してください。';
      case ErrorCode.TIMEOUT:
        return 'リクエストがタイムアウトしました。';
      case ErrorCode.PLATFORM_MAINTENANCE:
        return 'プラットフォームがメンテナンス中です。';
      case ErrorCode.VALIDATION_ERROR:
        return '入力内容に誤りがあります。';
      default:
        return 'エラーが発生しました。しばらく待ってから再試行してください。';
    }
  }
}