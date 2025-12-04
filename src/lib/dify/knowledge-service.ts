import {
  DifyDataset,
  DifyDatasetListResponse,
  DifyDocument,
  DifyDocumentListResponse,
  DifySegment,
  DifySegmentListResponse,
  DifyCreateDatasetRequest,
  DifyCreateDocumentRequest,
  DifyCreateSegmentRequest,
  DifyRetrievalRequest,
  DifyRetrievalResponse,
} from '@/types/dify';

export interface KnowledgeServiceConfig {
  apiKey: string;
  baseUrl: string;
}

/**
 * Dify Knowledge Base API Service
 *
 * 注意: Knowledge Base APIは「データセットAPIキー」を使用します。
 * アプリケーションAPIキー（app-xxx）ではなく、
 * Dify管理画面の「ナレッジベース」→「API」から取得してください。
 */
export class DifyKnowledgeService {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: KnowledgeServiceConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `API request failed: ${response.status}`);
    }

    return response.json();
  }

  // ========== Dataset (ナレッジベース) 操作 ==========

  /**
   * ナレッジベース一覧を取得
   */
  async listDatasets(page: number = 1, limit: number = 20): Promise<DifyDatasetListResponse> {
    return this.request<DifyDatasetListResponse>(
      `/datasets?page=${page}&limit=${limit}`
    );
  }

  /**
   * ナレッジベースを作成
   */
  async createDataset(data: DifyCreateDatasetRequest): Promise<DifyDataset> {
    return this.request<DifyDataset>('/datasets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * ナレッジベースを削除
   */
  async deleteDataset(datasetId: string): Promise<void> {
    await this.request(`/datasets/${datasetId}`, {
      method: 'DELETE',
    });
  }

  // ========== Document (ドキュメント) 操作 ==========

  /**
   * ドキュメント一覧を取得
   */
  async listDocuments(
    datasetId: string,
    page: number = 1,
    limit: number = 20,
    keyword?: string
  ): Promise<DifyDocumentListResponse> {
    let url = `/datasets/${datasetId}/documents?page=${page}&limit=${limit}`;
    if (keyword) {
      url += `&keyword=${encodeURIComponent(keyword)}`;
    }
    return this.request<DifyDocumentListResponse>(url);
  }

  /**
   * テキストからドキュメントを作成
   */
  async createDocumentByText(
    datasetId: string,
    data: DifyCreateDocumentRequest
  ): Promise<{ document: DifyDocument; batch: string }> {
    return this.request(`/datasets/${datasetId}/document/create_by_text`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * ファイルからドキュメントを作成
   */
  async createDocumentByFile(
    datasetId: string,
    file: File,
    processRule?: DifyCreateDocumentRequest['process_rule']
  ): Promise<{ document: DifyDocument; batch: string }> {
    const formData = new FormData();
    formData.append('file', file);

    if (processRule) {
      formData.append('process_rule', JSON.stringify(processRule));
    } else {
      formData.append('process_rule', JSON.stringify({ mode: 'automatic' }));
    }

    const response = await fetch(
      `${this.baseUrl}/datasets/${datasetId}/document/create_by_file`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `File upload failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * ドキュメントを更新（テキスト）
   */
  async updateDocumentByText(
    datasetId: string,
    documentId: string,
    data: DifyCreateDocumentRequest
  ): Promise<{ document: DifyDocument; batch: string }> {
    return this.request(`/datasets/${datasetId}/documents/${documentId}/update_by_text`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * ドキュメントを削除
   */
  async deleteDocument(datasetId: string, documentId: string): Promise<void> {
    await this.request(`/datasets/${datasetId}/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  /**
   * インデックス状態を取得
   */
  async getIndexingStatus(
    datasetId: string,
    batch: string
  ): Promise<{ data: Array<{ id: string; indexing_status: string; completed_segments: number; total_segments: number; error?: string }> }> {
    return this.request(`/datasets/${datasetId}/documents/${batch}/indexing-status`);
  }

  // ========== Segment (チャンク) 操作 ==========

  /**
   * セグメント一覧を取得
   */
  async listSegments(
    datasetId: string,
    documentId: string,
    keyword?: string,
    status?: 'completed' | 'indexing'
  ): Promise<DifySegmentListResponse> {
    let url = `/datasets/${datasetId}/documents/${documentId}/segments`;
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (status) params.append('status', status);
    if (params.toString()) url += `?${params.toString()}`;

    return this.request<DifySegmentListResponse>(url);
  }

  /**
   * セグメントを追加
   */
  async addSegments(
    datasetId: string,
    documentId: string,
    data: DifyCreateSegmentRequest
  ): Promise<{ data: DifySegment[]; doc_form: string }> {
    return this.request(`/datasets/${datasetId}/documents/${documentId}/segments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * セグメントを更新
   */
  async updateSegment(
    datasetId: string,
    documentId: string,
    segmentId: string,
    data: { content: string; answer?: string; keywords?: string[]; enabled?: boolean }
  ): Promise<{ data: DifySegment; doc_form: string }> {
    return this.request(
      `/datasets/${datasetId}/documents/${documentId}/segments/${segmentId}`,
      {
        method: 'POST',
        body: JSON.stringify({ segment: data }),
      }
    );
  }

  /**
   * セグメントを削除
   */
  async deleteSegment(
    datasetId: string,
    documentId: string,
    segmentId: string
  ): Promise<void> {
    await this.request(
      `/datasets/${datasetId}/documents/${documentId}/segments/${segmentId}`,
      {
        method: 'DELETE',
      }
    );
  }

  // ========== 検索 ==========

  /**
   * ナレッジベースを検索（リトリーバル）
   */
  async retrieve(
    datasetId: string,
    data: DifyRetrievalRequest
  ): Promise<DifyRetrievalResponse> {
    return this.request(`/datasets/${datasetId}/retrieve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// シングルトンインスタンス用のファクトリ関数
export function createKnowledgeService(config: KnowledgeServiceConfig): DifyKnowledgeService {
  return new DifyKnowledgeService(config);
}
