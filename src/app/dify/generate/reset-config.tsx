'use client';

import { useDifyStore } from '@/store/difyStore';

export default function ResetConfigButton() {
  const { clearConfig, setConfig, config } = useDifyStore();
  
  const handleForceUpdate = () => {
    if (config && config.apiKey) {
      // 設定を強制的に再設定
      setConfig({ ...config });
      alert('設定を更新しました。');
    }
  };
  
  const handleReset = () => {
    if (window.confirm('Dify設定をリセットしますか？')) {
      clearConfig();
      // Cookieもクリア
      fetch('/api/dify/config', { method: 'DELETE' });
      alert('設定をリセットしました。AI設定ページで再設定してください。');
    }
  };
  
  return (
    <div className="flex gap-2">
      <button
        onClick={handleForceUpdate}
        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
      >
        設定を再読み込み
      </button>
      <button
        onClick={handleReset}
        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
      >
        設定をリセット
      </button>
    </div>
  );
}