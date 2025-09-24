declare global {
  // eslint-disable-next-line no-var
  var twitterConfig: {
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessTokenSecret: string;
    updatedAt: string;
  } | undefined;
}

export {};
