import { useEffect } from 'react';

import { router } from 'expo-router';

import AsyncStorage from
'@react-native-async-storage/async-storage';

export default function Index() {

  useEffect(() => {

    const bootstrap =
      async () => {

        try {

          // Auth token
          const token =
            await AsyncStorage.getItem(
              '@auth_access_token'
            );

          // Onboarding state
          const onboardingComplete =
            await AsyncStorage.getItem(
              '@onboarding_complete'
            );

          // NOT LOGGED IN
          if (!token) {

            router.replace(
              '/(auth)/login'
            );

            return;
          }

          // LOGGED IN
          // BUT onboarding incomplete
          if (
            onboardingComplete !==
            'true'
          ) {

            router.replace(
              '/onboarding/welcome'
            );

            return;
          }

          // FULLY READY
          router.replace('/(tabs)');

        } catch (error) {

          console.log(
            'BOOTSTRAP ERROR:',
            error
          );

          router.replace(
            '/(auth)/login'
          );
        }
      };

    bootstrap();

  }, []);

  return null;
}