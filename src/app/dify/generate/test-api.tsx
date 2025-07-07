'use client';

import { useState } from 'react';
import { BeakerIcon } from '@heroicons/react/24/outline';

export default function TestDifyAPI() {
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  
  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/dify/simple-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'テストメッセージ',
        }),
      });
      
      const data = await response.json();
      setTestResult(data);
      
      // コンソールにも出力
      console.log('Test result:', data);
    } catch (error) {
      console.error('Test error:', error);
      setTestResult({ error: 'テストが失敗しました' });
    } finally {
      setIsTesting(false);
    }
  };
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start">
        <BeakerIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-900">API接続テスト</h3>
          <p className="text-sm text-yellow-700 mt-1">
            最小限のパラメータでDify APIをテストします
          </p>
          
          <button
            onClick={handleTest}
            disabled={isTesting}
            className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-400 text-sm"
          >
            {isTesting ? 'テスト中...' : 'APIをテスト'}
          </button>
          
          {testResult && (
            <div className="mt-3 p-2 bg-white rounded text-sm">
              <pre className="overflow-auto text-xs">
                {JSON.stringify(testResult, null, 2)}
              </pre>
              {testResult.success && (
                <p className="text-green-600 mt-2 font-medium">
                  ✅ {testResult.type} APIが正常に動作しています
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}