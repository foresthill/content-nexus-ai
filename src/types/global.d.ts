declare global {
  var twitterConfig: {
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessTokenSecret: string;
    updatedAt: string;
  } | undefined;
}

export {};
