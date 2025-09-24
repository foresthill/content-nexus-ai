/**
 * テキストをTwitterの文字数制限（280文字）で分割する
 * @param text 分割するテキスト
 * @param maxLength 最大文字数（デフォルト: 280）
 * @returns 分割されたテキストの配列
 */
export function splitTextForTwitter(text: string, maxLength: number = 280): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const tweets: string[] = [];
  let currentTweet = '';
  const words = text.split(/(\s+)/); // スペースを保持しながら分割

  for (const word of words) {
    // 現在のツイートに単語を追加しても制限内か確認
    const potentialTweet = currentTweet + word;

    // スレッド番号を追加する余裕を残す（例：" (1/3)"）
    const reservedSpace = 10; // スレッド番号用のスペース

    if (potentialTweet.length <= maxLength - reservedSpace) {
      currentTweet = potentialTweet;
    } else {
      // 現在のツイートを保存して新しいツイートを開始
      if (currentTweet.trim()) {
        tweets.push(currentTweet.trim());
      }
      currentTweet = word;
    }
  }

  // 最後のツイートを追加
  if (currentTweet.trim()) {
    tweets.push(currentTweet.trim());
  }

  // スレッド番号を追加
  const totalTweets = tweets.length;
  if (totalTweets > 1) {
    return tweets.map((tweet, index) => {
      const threadNumber = ` (${index + 1}/${totalTweets})`;
      // スレッド番号を追加しても文字数制限を超える場合は調整
      if (tweet.length + threadNumber.length > maxLength) {
        const adjustedLength = maxLength - threadNumber.length - 3;
        return tweet.substring(0, adjustedLength) + '...' + threadNumber;
      }
      return tweet + threadNumber;
    });
  }

  return tweets;
}

/**
 * 改行や句読点を考慮してテキストを自然に分割する
 */
export function smartSplitText(text: string, maxLength: number = 280): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const tweets: string[] = [];
  const sentences = text.split(/([。！？\.\!\?]\s*)/);
  let currentTweet = '';
  const reservedSpace = 10; // スレッド番号用

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const nextSentence = i + 1 < sentences.length ? sentences[i + 1] : '';
    const combined = sentence + (nextSentence.match(/^[。！？\.\!\?]/) ? nextSentence : '');

    if (currentTweet.length + combined.length <= maxLength - reservedSpace) {
      currentTweet += combined;
      if (nextSentence.match(/^[。！？\.\!\?]/)) {
        i++; // 句読点をスキップ
      }
    } else {
      if (currentTweet.trim()) {
        tweets.push(currentTweet.trim());
      }
      currentTweet = combined;
      if (nextSentence.match(/^[。！？\.\!\?]/)) {
        i++; // 句読点をスキップ
      }
    }
  }

  // 最後のツイートを追加
  if (currentTweet.trim()) {
    tweets.push(currentTweet.trim());
  }

  // スレッド番号を追加
  const totalTweets = tweets.length;
  if (totalTweets > 1) {
    return tweets.map((tweet, index) => {
      const threadNumber = ` (${index + 1}/${totalTweets})`;
      if (tweet.length + threadNumber.length > maxLength) {
        const adjustedLength = maxLength - threadNumber.length - 3;
        return tweet.substring(0, adjustedLength) + '...' + threadNumber;
      }
      return tweet + threadNumber;
    });
  }

  return tweets;
}

/**
 * ハッシュタグを保持しながらテキストを分割
 */
export function splitTextWithHashtags(
  text: string,
  hashtags: string[],
  maxLength: number = 280
): string[] {
  // ハッシュタグ部分を抽出
  const hashtagText = hashtags.length > 0 ? '\n\n' + hashtags.join(' ') : '';
  const mainText = text.replace(new RegExp(hashtags.join('|'), 'g'), '').trim();

  // メインテキストが短い場合はハッシュタグと一緒に投稿
  if (mainText.length + hashtagText.length <= maxLength) {
    return [mainText + hashtagText];
  }

  // メインテキストを分割
  const tweets = smartSplitText(mainText, maxLength - hashtagText.length);

  // 最後のツイートにハッシュタグを追加
  if (tweets.length > 0 && hashtagText) {
    const lastIndex = tweets.length - 1;
    if (tweets[lastIndex].length + hashtagText.length <= maxLength) {
      tweets[lastIndex] += hashtagText;
    } else {
      // ハッシュタグが入りきらない場合は別ツイートとして追加
      tweets.push(hashtagText.trim());
    }
  }

  return tweets;
}