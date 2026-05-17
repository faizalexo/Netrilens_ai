import * as WebBrowser from 'expo-web-browser';

import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {

  const [

    request,

    response,

    promptAsync,

  ] = Google.useAuthRequest({

    androidClientId:
      '64625057650-neffdbmobtd0kfe74ck8uj4jbgbojqna.apps.googleusercontent.com',

    webClientId:
      '64625057650-l12k21bidhfedijfvcb7uegm7u6erbld.apps.googleusercontent.com',
  });

  return {

    request,

    response,

    promptAsync,
  };
}