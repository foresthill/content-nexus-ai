'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useVideoStore from '@/store/videoStore';
import { VideoStatus, VideoEffect } from '@/types/video';

type EffectType = 'filter' | 'transition' | 'text' | 'sound';

// 編集効果のモック
const mockEffects = {
  filters: [
    { id: 'filter1', name: 'ナチュラル', type: 'filter', iconPath: '🌈' },
    { id: 'filter2', name: 'モノクロ', type: 'filter', iconPath: '⚫️' },
    { id: 'filter3', name: 'セピア', type: 'filter', iconPath: '🟤' },
    { id: 'filter4', name: 'ビビッド', type: 'filter', iconPath: '🔆' },
    { id: 'filter5', name: 'ドラマチック', type: 'filter', iconPath: '🎭' },
    { id: 'filter6', name: 'レトロ', type: 'filter', iconPath: '📺' },
  ],
  transitions: [
    { id: 'transition1', name: 'カット', type: 'transition', iconPath: '✂️' },
    { id: 'transition2', name: 'フェード', type: 'transition', iconPath: '🌫️' },
    { id: 'transition3', name: 'ワイプ', type: 'transition', iconPath: '↔️' },
    { id: 'transition4', name: 'ズーム', type: 'transition', iconPath: '🔍' },
  ],
  texts: [
    { id: 'text1', name: 'シンプル', type: 'text', iconPath: 'Aa' },
    { id: 'text2', name: 'ポップ', type: 'text', iconPath: 'Aa' },
    { id: 'text3', name: 'アニメ風', type: 'text', iconPath: 'Aa' },
    { id: 'text4', name: 'キャプション', type: 'text', iconPath: 'Aa' },
  ],
  sounds: [
    { id: 'sound1', name: 'トレンド曲1', type: 'sound', iconPath: '🎵' },
    { id: 'sound2', name: 'トレンド曲2', type: 'sound', iconPath: '🎵' },
    { id: 'sound3', name: 'アンビエント', type: 'sound', iconPath: '🎵' },
    { id: 'sound4', name: 'エネルギッシュ', type: 'sound', iconPath: '🎵' },
    { id: 'sound5', name: 'ロマンチック', type: 'sound', iconPath: '🎵' },
  ],
};

// AIアイデア提案のモックデータ
const mockAIIdeas = [
  {
    id: 'idea1',
    title: '「5つの簡単な節約術」',
    description: '自宅でできる簡単な節約方法を視覚的に紹介する動画を作成',
    hashtags: ['#節約術', '#簡単', '#お金', '#生活ハック']
  },
  {
    id: 'idea2',
    title: '「効率的な作業スペース」',
    description: '在宅ワークの生産性を上げるデスク周りのアレンジアイデア',
    hashtags: ['#在宅ワーク', '#デスク', '#生産性', '#テレワーク']
  },
  {
    id: 'idea3',
    title: '「1分でできる朝食レシピ」',
    description: '忙しい朝にぴったりの簡単で栄養満点の朝食アイデア',
    hashtags: ['#朝食', '#時短', '#料理', '#健康', '#レシピ']
  }
];

export default function VideoEditPage() {
  const router = useRouter();
  const { videos, updateVideo, isLoading } = useVideoStore();
  
  // 編集中の動画 (最新のものを使用)
  const [currentVideo, setCurrentVideo] = useState(videos[0] || null);
  
  // 選択された効果
  const [selectedEffects, setSelectedEffects] = useState<VideoEffect[]>([]);
  
  // 編集モード
  const [activeTab, setActiveTab] = useState<EffectType>('filter');
  
  // AIアシスタント
  const [showAIIdeas, setShowAIIdeas] = useState(false);
  
  // 編集タイムライン
  const [timelinePosition, setTimelinePosition] = useState(0);
  
  // テキストエディタ
  const [textEditorOpen, setTextEditorOpen] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [textSettings, setTextSettings] = useState({
    color: '#ffffff',
    size: 'medium',
    position: 'center',
    animation: 'none',
  });
  
  // 編集プレビュー
  const [isPlaying, setIsPlaying] = useState(false);
  
  // 現在のビデオをモックから取得
  useEffect(() => {
    // 本来はAPIから最新のビデオプロジェクトを取得する
    if (videos.length > 0 && !currentVideo) {
      setCurrentVideo(videos[videos.length - 1]);
    }
  }, [videos, currentVideo]);
  
  // 動画効果の追加
  const addEffect = (effect: {id: string, name: string, type: EffectType, iconPath: string}) => {
    // 効果のタイプに応じた設定
    let settings: Record<string, unknown> = {};
    
    switch (effect.type) {
      case 'filter':
        settings = { intensity: 1.0 };
        break;
      case 'transition':
        settings = { duration: 0.5 };
        break;
      case 'text':
        settings = { 
          text: textContent || 'サンプルテキスト',
          color: textSettings.color,
          size: textSettings.size,
          position: textSettings.position,
          animation: textSettings.animation
        };
        setTextEditorOpen(true);
        break;
      case 'sound':
        settings = { volume: 1.0, fadeIn: 0, fadeOut: 0 };
        break;
    }
    
    // 新しい効果を追加
    const newEffect: VideoEffect = {
      id: effect.id,
      name: effect.name,
      type: effect.type,
      settings,
      startTime: timelinePosition,
      endTime: timelinePosition + (effect.type === 'transition' ? 0.5 : 5),
    };
    
    setSelectedEffects([...selectedEffects, newEffect]);
  };
  
  // 効果の削除
  const removeEffect = (effectId: string) => {
    setSelectedEffects(selectedEffects.filter(effect => effect.id !== effectId));
  };
  
  // 動画の保存処理
  const handleSaveVideo = async () => {
    if (!currentVideo) return;
    
    try {
      // 動画の更新
      await updateVideo(currentVideo.id, {
        effects: selectedEffects,
        status: VideoStatus.READY,
      });
      
      // 完了画面への遷移
      router.push('/videos/complete');
    } catch (error) {
      console.error('動画の保存に失敗しました', error);
    }
  };
  
  // AIアイデアを適用
  const applyAIIdea = (idea: typeof mockAIIdeas[0]) => {
    if (!currentVideo) return;
    
    // タイトルと説明文を更新
    setCurrentVideo({
      ...currentVideo,
      title: idea.title,
      description: idea.description,
      tags: idea.hashtags.map(tag => tag.replace('#', '')),
    });
    
    setShowAIIdeas(false);
  };
  
  // テキストエディタの保存
  const saveTextEdit = () => {
    // テキスト効果の更新
    const updatedEffects = selectedEffects.map(effect => {
      if (effect.type === 'text') {
        return {
          ...effect,
          settings: {
            ...effect.settings,
            text: textContent,
            ...textSettings,
          }
        };
      }
      return effect;
    });
    
    setSelectedEffects(updatedEffects);
    setTextEditorOpen(false);
  };
  
  if (!currentVideo) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">動画が見つかりません。動画をアップロードしてください。</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-full mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">動画編集</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAIIdeas(!showAIIdeas)}
            className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
            AIアイデア
          </button>
          <Link 
            href="/videos" 
            className="text-gray-600 hover:text-gray-800 font-medium flex items-center"
          >
            キャンセル
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* 左側パネル: 効果リスト */}
        <div className="lg:col-span-1 bg-white shadow rounded-lg p-4 overflow-hidden flex flex-col h-[calc(100vh-160px)]">
          <div className="mb-4">
            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 py-2 text-sm font-medium ${activeTab === 'filter' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('filter')}
              >
                フィルター
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium ${activeTab === 'transition' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('transition')}
              >
                トランジション
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium ${activeTab === 'text' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('text')}
              >
                テキスト
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium ${activeTab === 'sound' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('sound')}
              >
                サウンド
              </button>
            </div>
          </div>
          
          <div className="overflow-y-auto flex-grow">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
              {activeTab === 'filter' && mockEffects.filters.map((effect) => (
                <button
                  key={effect.id}
                  className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                  onClick={() => addEffect(effect)}
                >
                  <span className="text-2xl mb-1">{effect.iconPath}</span>
                  <span className="text-xs text-gray-700">{effect.name}</span>
                </button>
              ))}
              
              {activeTab === 'transition' && mockEffects.transitions.map((effect) => (
                <button
                  key={effect.id}
                  className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                  onClick={() => addEffect(effect)}
                >
                  <span className="text-2xl mb-1">{effect.iconPath}</span>
                  <span className="text-xs text-gray-700">{effect.name}</span>
                </button>
              ))}
              
              {activeTab === 'text' && mockEffects.texts.map((effect) => (
                <button
                  key={effect.id}
                  className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                  onClick={() => addEffect(effect)}
                >
                  <span className="text-xl font-bold mb-1">{effect.iconPath}</span>
                  <span className="text-xs text-gray-700">{effect.name}</span>
                </button>
              ))}
              
              {activeTab === 'sound' && mockEffects.sounds.map((effect) => (
                <button
                  key={effect.id}
                  className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                  onClick={() => addEffect(effect)}
                >
                  <span className="text-2xl mb-1">{effect.iconPath}</span>
                  <span className="text-xs text-gray-700">{effect.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* AIアシスタント提案 - モバイルでは表示しない */}
          {showAIIdeas && (
            <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100 hidden lg:block">
              <h3 className="text-sm font-medium text-indigo-800 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
                AIコンテンツ提案
              </h3>
              <p className="text-xs text-indigo-700 mb-3">
                動画のコンテンツアイデアと最適なハッシュタグを提案します
              </p>
              
              <div className="space-y-2">
                {mockAIIdeas.map((idea) => (
                  <div key={idea.id} className="p-2 bg-white rounded border border-indigo-100">
                    <h4 className="text-sm font-medium text-gray-900">{idea.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{idea.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {idea.hashtags.map((tag) => (
                        <span key={tag} className="text-xs bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => applyAIIdea(idea)}
                      className="w-full mt-2 text-xs bg-indigo-600 text-white py-1 px-2 rounded hover:bg-indigo-700 transition-colors"
                    >
                      このアイデアを使用
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* 中央: プレビューとタイムライン */}
        <div className="lg:col-span-3 space-y-4">
          {/* プレビュー */}
          <div className="bg-white shadow rounded-lg p-4">
            <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden relative">
              <video 
                src={currentVideo.url}
                className="w-full h-full object-contain"
                controls={false}
                loop
                muted
                autoPlay={isPlaying}
                playsInline
              />
              
              {/* エフェクトプレビュー表示 (実際のアプリではここに動的エフェクトが表示される) */}
              {selectedEffects.filter(e => e.type === 'text').map((effect, index) => (
                <div 
                  key={index}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    color: (effect.settings.color as string) || '#ffffff',
                    fontSize: effect.settings.size === 'large' ? '2rem' : effect.settings.size === 'medium' ? '1.5rem' : '1rem',
                    textAlign: 'center',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    fontWeight: 'bold',
                    padding: '1rem'
                  }}
                >
                  {(effect.settings.text as string) || 'サンプルテキスト'}
                </div>
              ))}
              
              {/* プレイコントロール */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`rounded-full bg-black bg-opacity-50 p-3 text-white ${isPlaying ? 'opacity-0' : 'opacity-100'} hover:bg-opacity-70 transition-opacity`}
                >
                  {isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900">{currentVideo.title}</h2>
                <p className="text-sm text-gray-500 mt-1">{currentVideo.duration}秒</p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {}}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  リセット
                </button>
                <button
                  onClick={() => {}}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                  </svg>
                  複製
                </button>
              </div>
            </div>
          </div>
          
          {/* タイムライン */}
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">タイムライン</h3>
            
            <div className="h-24 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 relative">
              {/* タイムラインスケール */}
              <div className="absolute top-0 left-0 right-0 h-6 flex border-b border-gray-200 bg-gray-100">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex-1 border-r border-gray-200 text-xs text-gray-500 flex items-center justify-center">
                    {i * 3}s
                  </div>
                ))}
              </div>
              
              {/* 効果表示エリア */}
              <div className="absolute top-6 left-0 right-0 bottom-0 p-1">
                {/* 読み込みスケール */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 z-10" style={{ left: `${(timelinePosition / 30) * 100}%` }}></div>
                
                {/* 効果ブロック */}
                {selectedEffects.map((effect, index) => {
                  // 効果の種類によって色を変える
                  const getColor = () => {
                    switch(effect.type) {
                      case 'filter': return 'bg-blue-200 border-blue-300';
                      case 'transition': return 'bg-green-200 border-green-300';
                      case 'text': return 'bg-purple-200 border-purple-300';
                      case 'sound': return 'bg-yellow-200 border-yellow-300';
                      default: return 'bg-gray-200 border-gray-300';
                    }
                  };
                  
                  // 効果の長さとタイミングを計算
                  const startPercent = ((effect.startTime || 0) / 30) * 100;
                  const durationPercent = (((effect.endTime || 5) - (effect.startTime || 0)) / 30) * 100;
                  
                  return (
                    <div 
                      key={index}
                      className={`absolute rounded px-2 py-1 text-xs border flex items-center justify-between cursor-move ${getColor()}`}
                      style={{ 
                        left: `${startPercent}%`, 
                        width: `${durationPercent}%`,
                        top: index % 3 * 14 + 2 + 'px',
                        height: '14px'
                      }}
                    >
                      <span className="truncate">{effect.name}</span>
                      <button
                        onClick={() => removeEffect(effect.id)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* タイムラインコントロール */}
            <div className="flex space-x-2 mt-3">
              <button 
                className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                onClick={() => setTimelinePosition(Math.max(0, timelinePosition - 1))}
              >
                -1s
              </button>
              <input 
                type="range" 
                min="0" 
                max="30" 
                value={timelinePosition}
                onChange={(e) => setTimelinePosition(parseInt(e.target.value))}
                className="flex-grow"
              />
              <button 
                className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                onClick={() => setTimelinePosition(Math.min(30, timelinePosition + 1))}
              >
                +1s
              </button>
              <span className="text-xs text-gray-500 min-w-[40px]">{timelinePosition}s</span>
            </div>
          </div>
        </div>
        
        {/* 右側パネル: 設定と出力オプション */}
        <div className="lg:col-span-1 space-y-4">
          {/* AIアシスタント提案 - モバイルのみ表示 */}
          {showAIIdeas && (
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 lg:hidden">
              <h3 className="text-sm font-medium text-indigo-800 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
                AIコンテンツ提案
              </h3>
              
              <div className="space-y-2">
                {mockAIIdeas.map((idea) => (
                  <div key={idea.id} className="p-2 bg-white rounded border border-indigo-100">
                    <h4 className="text-sm font-medium text-gray-900">{idea.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{idea.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {idea.hashtags.map((tag) => (
                        <span key={tag} className="text-xs bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => applyAIIdea(idea)}
                      className="w-full mt-2 text-xs bg-indigo-600 text-white py-1 px-2 rounded hover:bg-indigo-700 transition-colors"
                    >
                      このアイデアを使用
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 動画説明 */}
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">動画情報</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="edit-title" className="block text-xs font-medium text-gray-700 mb-1">
                  タイトル
                </label>
                <input
                  type="text"
                  id="edit-title"
                  value={currentVideo.title}
                  onChange={(e) => setCurrentVideo({...currentVideo, title: e.target.value})}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="edit-description" className="block text-xs font-medium text-gray-700 mb-1">
                  説明文
                </label>
                <textarea
                  id="edit-description"
                  value={currentVideo.description}
                  onChange={(e) => setCurrentVideo({...currentVideo, description: e.target.value})}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  タグ
                </label>
                <div className="flex flex-wrap gap-1">
                  {currentVideo.tags.map((tag, i) => (
                    <span key={i} className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                      #{tag}
                      <button
                        type="button"
                        className="ml-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-600 hover:bg-indigo-200 hover:text-indigo-900 focus:outline-none focus:bg-indigo-500 focus:text-white"
                        onClick={() => {
                          const newTags = [...currentVideo.tags];
                          newTags.splice(i, 1);
                          setCurrentVideo({...currentVideo, tags: newTags});
                        }}
                      >
                        <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                          <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                        </svg>
                      </button>
                    </span>
                  ))}
                  
                  <input
                    type="text"
                    placeholder="+ タグを追加"
                    className="border-none text-xs focus:ring-0 text-gray-500 p-0 flex-grow min-w-[80px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        e.preventDefault();
                        const newTag = e.currentTarget.value.trim();
                        if (!currentVideo.tags.includes(newTag)) {
                          setCurrentVideo({
                            ...currentVideo,
                            tags: [...currentVideo.tags, newTag]
                          });
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* 出力設定 */}
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">出力設定</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  解像度
                </label>
                <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm">
                  <option>1080x1920 (縦型フルHD)</option>
                  <option>720x1280 (縦型HD)</option>
                  <option>1920x1080 (横型フルHD)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  出力形式
                </label>
                <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm">
                  <option>MP4 (H.264)</option>
                  <option>MOV (ProRes)</option>
                  <option>WebM (VP9)</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  id="auto-optimize"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  defaultChecked
                />
                <label htmlFor="auto-optimize" className="ml-2 block text-xs text-gray-700">
                  各プラットフォーム向けに自動最適化
                </label>
              </div>
            </div>
          </div>
          
          {/* アクションボタン */}
          <div className="bg-white shadow rounded-lg p-4">
            <div className="space-y-3">
              <button
                onClick={handleSaveVideo}
                disabled={isLoading}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isLoading ? '処理中...' : '保存して次へ'}
              </button>
              
              <button
                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                下書き保存
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* テキストエディタモーダル */}
      {textEditorOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full mx-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">テキストを編集</h3>
              <button
                onClick={() => setTextEditorOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="text-content" className="block text-sm font-medium text-gray-700 mb-1">
                  テキスト
                </label>
                <textarea
                  id="text-content"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="テキストを入力"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="text-color" className="block text-sm font-medium text-gray-700 mb-1">
                    色
                  </label>
                  <select
                    id="text-color"
                    value={textSettings.color}
                    onChange={(e) => setTextSettings({...textSettings, color: e.target.value})}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="#ffffff">白</option>
                    <option value="#000000">黒</option>
                    <option value="#ff0000">赤</option>
                    <option value="#00ff00">緑</option>
                    <option value="#0000ff">青</option>
                    <option value="#ffff00">黄</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="text-size" className="block text-sm font-medium text-gray-700 mb-1">
                    サイズ
                  </label>
                  <select
                    id="text-size"
                    value={textSettings.size}
                    onChange={(e) => setTextSettings({...textSettings, size: e.target.value})}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="small">小</option>
                    <option value="medium">中</option>
                    <option value="large">大</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="text-position" className="block text-sm font-medium text-gray-700 mb-1">
                    位置
                  </label>
                  <select
                    id="text-position"
                    value={textSettings.position}
                    onChange={(e) => setTextSettings({...textSettings, position: e.target.value})}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="top">上</option>
                    <option value="center">中央</option>
                    <option value="bottom">下</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="text-animation" className="block text-sm font-medium text-gray-700 mb-1">
                    アニメーション
                  </label>
                  <select
                    id="text-animation"
                    value={textSettings.animation}
                    onChange={(e) => setTextSettings({...textSettings, animation: e.target.value})}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="none">なし</option>
                    <option value="fade">フェード</option>
                    <option value="slide">スライド</option>
                    <option value="pop">ポップ</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setTextEditorOpen(false)}
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={saveTextEdit}
                  className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}