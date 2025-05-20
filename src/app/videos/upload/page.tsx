'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useVideoStore from '@/store/videoStore';
import { VideoType, VideoStatus } from '@/types/video';

export default function VideoUploadPage() {
  const router = useRouter();
  const { createVideo, isLoading } = useVideoStore();
  
  // アップロードファイル状態
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [processingStatus, setProcessingStatus] = useState<string>('準備完了');
  
  // フォーム状態
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // videoTypeは現在使用されていないが、将来的に使用する可能性があるため定義は維持
  const videoType = VideoType.SHORT;
  const [category, setCategory] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // 対応プラットフォーム設定
  const [targetPlatforms, setTargetPlatforms] = useState<{
    tiktok: boolean;
    youtube: boolean;
    instagram: boolean;
    line: boolean;
  }>({
    tiktok: true,
    youtube: true,
    instagram: false,
    line: false,
  });
  
  // ファイルアップロードハンドラー
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadedFile(file);
    
    // プレビューURLの生成
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
    
    // ファイル名からタイトル候補を生成
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
    
    // 擬似的なアップロード進行状況のシミュレーション
    setUploadProgress(0);
    setProcessingStatus('アップロード中...');
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setProcessingStatus('処理中...');
          
          // 擬似的な処理完了をシミュレーション
          setTimeout(() => {
            setProcessingStatus('準備完了');
          }, 1500);
          
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };
  
  // タグ追加ハンドラー
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  // タグ削除ハンドラー
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // カテゴリー変更ハンドラー
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!category.includes(value) && value !== '') {
      setCategory([...category, value]);
    }
  };
  
  // カテゴリー削除ハンドラー
  const handleRemoveCategory = (categoryToRemove: string) => {
    setCategory(category.filter(cat => cat !== categoryToRemove));
  };
  
  // 動画投稿ハンドラー
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadedFile || !title || !previewUrl) {
      return;
    }
    
    // 対象プラットフォームの配列生成
    const platforms: VideoType[] = [];
    if (targetPlatforms.tiktok) platforms.push(VideoType.TIKTOK);
    if (targetPlatforms.youtube) platforms.push(VideoType.YOUTUBE_SHORTS);
    if (targetPlatforms.instagram) platforms.push(VideoType.INSTAGRAM_REELS);
    if (targetPlatforms.line) platforms.push(VideoType.LINE_VOOM);
    
    try {
      // VideoオブジェクトのPreview作成
      const newVideo = {
        title,
        description,
        type: videoType,
        url: previewUrl, // 実際にはアップロード後のURLが入る
        thumbnailUrl: previewUrl, // 実際には生成されたサムネイルURLが入る
        duration: 30, // 仮の値（実際は動画から計算）
        author: 'Current User', // 実際にはログインユーザー情報から取得
        category,
        tags,
        status: VideoStatus.PROCESSING,
        aspectRatio: { width: 9, height: 16 }, // 仮定の縦長アスペクト比
      };
      
      // 動画作成（実際のAPIリクエストではなくZustandストアを使用）
      await createVideo(newVideo);
      
      // 編集画面に遷移
      setProcessingStatus('アップロード完了！');
      
      // 少し遅延させて編集画面に遷移
      setTimeout(() => {
        router.push('/videos/edit');
      }, 1000);
      
    } catch (error) {
      console.error('動画のアップロードに失敗しました', error);
      setProcessingStatus('エラーが発生しました');
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">ショート動画アップロード</h1>
        <Link 
          href="/videos" 
          className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
          </svg>
          戻る
        </Link>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* 左側: ファイルアップロードエリア */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">1. 動画をアップロード</h2>
              
              {!previewUrl ? (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => document.getElementById('video-upload')?.click()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                  <p className="mt-4 text-gray-500">動画ファイルをドラッグ＆ドロップ<br />または<span className="text-indigo-600 font-medium">クリックして選択</span></p>
                  <p className="mt-2 text-xs text-gray-400">MP4, MOV, AVI形式 (最大200MB)</p>
                  <input 
                    id="video-upload" 
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="relative">
                  <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden">
                    <video 
                      src={previewUrl} 
                      className="w-full h-full object-contain"
                      controls
                    />
                  </div>
                  <button
                    onClick={() => {
                      setPreviewUrl(null);
                      setUploadedFile(null);
                      setUploadProgress(0);
                      setProcessingStatus('準備完了');
                    }}
                    className="absolute top-2 right-2 bg-gray-900 bg-opacity-70 rounded-full p-1 text-white hover:bg-opacity-100 transition-colors"
                    title="動画を削除"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              
              {uploadProgress > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-1 flex justify-between">
                    <span>{processingStatus}</span>
                    <span>{uploadProgress}%</span>
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${processingStatus === '準備完了' ? 'bg-green-500' : 'bg-indigo-600'}`}
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">2. 配信プラットフォーム</h2>
              <div className="grid grid-cols-2 gap-3">
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${targetPlatforms.tiktok ? 'bg-indigo-50 border-indigo-200' : 'border-gray-200 hover:bg-gray-50'}`}
                  onClick={() => setTargetPlatforms({...targetPlatforms, tiktok: !targetPlatforms.tiktok})}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${targetPlatforms.tiktok ? 'bg-indigo-600' : 'border border-gray-300'}`}>
                      {targetPlatforms.tiktok && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 text-white">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium">TikTok</span>
                  </div>
                </div>
                
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${targetPlatforms.youtube ? 'bg-indigo-50 border-indigo-200' : 'border-gray-200 hover:bg-gray-50'}`}
                  onClick={() => setTargetPlatforms({...targetPlatforms, youtube: !targetPlatforms.youtube})}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${targetPlatforms.youtube ? 'bg-indigo-600' : 'border border-gray-300'}`}>
                      {targetPlatforms.youtube && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 text-white">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium">YouTube Shorts</span>
                  </div>
                </div>
                
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${targetPlatforms.instagram ? 'bg-indigo-50 border-indigo-200' : 'border-gray-200 hover:bg-gray-50'}`}
                  onClick={() => setTargetPlatforms({...targetPlatforms, instagram: !targetPlatforms.instagram})}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${targetPlatforms.instagram ? 'bg-indigo-600' : 'border border-gray-300'}`}>
                      {targetPlatforms.instagram && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 text-white">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium">Instagram Reels</span>
                  </div>
                </div>
                
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${targetPlatforms.line ? 'bg-indigo-50 border-indigo-200' : 'border-gray-200 hover:bg-gray-50'}`}
                  onClick={() => setTargetPlatforms({...targetPlatforms, line: !targetPlatforms.line})}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${targetPlatforms.line ? 'bg-indigo-600' : 'border border-gray-300'}`}>
                      {targetPlatforms.line && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 text-white">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium">LINE VOOM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 右側: メタデータフォーム */}
          <div className="lg:col-span-3">
            <h2 className="text-lg font-medium text-gray-900 mb-4">3. 動画情報</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="動画のタイトルを入力"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  説明文
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="動画の説明を入力"
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  カテゴリー
                </label>
                <select
                  id="category"
                  onChange={handleCategoryChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value=""
                >
                  <option value="" disabled>カテゴリーを選択</option>
                  <option value="マーケティング">マーケティング</option>
                  <option value="アフィリエイト">アフィリエイト</option>
                  <option value="SEO">SEO</option>
                  <option value="SNS">SNS活用</option>
                  <option value="ブログ運営">ブログ運営</option>
                  <option value="動画編集">動画編集</option>
                  <option value="副業">副業</option>
                </select>
                
                {category.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {category.map((cat) => (
                      <span key={cat} className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-0.5 text-sm font-medium text-indigo-800">
                        {cat}
                        <button
                          type="button"
                          className="ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-600 hover:bg-indigo-200 hover:text-indigo-900 focus:outline-none focus:bg-indigo-500 focus:text-white"
                          onClick={() => handleRemoveCategory(cat)}
                        >
                          <svg className="h-2.5 w-2.5" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                            <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  タグ
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="タグを入力"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    追加
                  </button>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-0.5 text-sm font-medium text-indigo-800">
                        #{tag}
                        <button
                          type="button"
                          className="ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-600 hover:bg-indigo-200 hover:text-indigo-900 focus:outline-none focus:bg-indigo-500 focus:text-white"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <svg className="h-2.5 w-2.5" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                            <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  className="mr-4 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => router.push('/videos')}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !uploadedFile || !title || uploadProgress < 100 || processingStatus !== '準備完了'}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                    isLoading || !uploadedFile || !title || uploadProgress < 100 || processingStatus !== '準備完了'
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  }`}
                >
                  {isLoading ? '処理中...' : '次へ: 動画編集'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}