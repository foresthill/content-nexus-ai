'use client';

import { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

export default function CheckAppType() {
  const [appInfo, setAppInfo] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  
  const handleCheck = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/dify/app-info');
      const data = await response.json();
      setAppInfo(data);
    } catch (error) {
      console.error('App check error:', error);
      setAppInfo({ error: 'アプリケーション情報の取得に失敗しました' });
    } finally {
      setIsChecking(false);
    }
  };
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start">
        <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-900">Difyアプリケーションタイプ</h3>
          <p className="text-sm text-blue-700 mt-1">
            エラーが発生した場合は、Difyアプリケーションのタイプを確認してください。
          </p>
          
          <button
            onClick={handleCheck}
            disabled={isChecking}
            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 text-sm"
          >
            {isChecking ? '確認中...' : 'アプリタイプを確認'}
          </button>
          
          {appInfo && (
            <div className="mt-3 p-2 bg-white rounded text-sm">
              {appInfo.error ? (
                <p className="text-red-600">{appInfo.error}</p>
              ) : (
                <>
                  <p><strong>タイプ:</strong> {appInfo.appType}</p>
                  <p className="text-xs text-gray-600 mt-1">{appInfo.message}</p>
                  {appInfo.appType === 'unknown' && (
                    <p className="text-xs text-orange-600 mt-1">
                      ワークフロータイプではない可能性があります。
                      Completion APIを使用して生成されます。
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}