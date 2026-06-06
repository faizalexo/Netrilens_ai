import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId:
    '64625057650-l12k21bidhfedijfvcb7uegm7u6erbld.apps.googleusercontent.com',
  offlineAccess: true,
});

export const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();

    const userInfo =
      await GoogleSignin.signIn();

    console.log(
      'GOOGLE USER:',
      userInfo
    );

    return userInfo;

  } catch (error: any) {

    console.log(
      'GOOGLE ERROR:',
      error
    );

    throw error;
  }
};