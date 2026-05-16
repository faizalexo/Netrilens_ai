import { useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {

  useEffect(() => {

    const bootstrap = async () => {

      try {

        // onboarding state
        const onboardingComplete =
          await AsyncStorage.getItem(
            '@onboarding_complete'
          );

        // auth token
        const token =
          await AsyncStorage.getItem(
            '@auth_access_token'
          );

        console.log(
          'ONBOARDING:',
          onboardingComplete
        );

        console.log(
          'TOKEN:',
          token
        );

        // FIRST TIME USER
        if (
          onboardingComplete !== 'true'
        ) {

          router.replace(
            '/onboarding/welcome'
          );

          return;
        }

        // NOT LOGGED IN
        if (!token) {

          router.replace(
            '/(auth)/login'
          );

          return;
        }

        // FULLY AUTHENTICATED
        router.replace('/(tabs)');

      } catch (error) {

        console.log(
          'BOOTSTRAP ERROR:',
          error
        );

        router.replace(
          '/onboarding/welcome'
        );
      }
    };

    bootstrap();

  }, []);

  return null;
}