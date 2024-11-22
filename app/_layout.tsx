import {Stack} from 'expo-router';
import ErrorBoundary from 'react-native-error-boundary';
import * as SplashScreen from 'expo-splash-screen';
import {useEffect, useRef, useState} from 'react';
import 'react-native-reanimated';
import * as Notifications from 'expo-notifications';
import { Notification, Subscription} from 'expo-notifications';
import {Linking} from "react-native";
import ErrorFallback from "@/app/ErrorFallback";


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {


    const [, setNotification] = useState<Notification>();
    const notificationListener = useRef<Subscription>();
    const responseListener = useRef<Subscription>();

    const lastNotificationResponse = Notifications.useLastNotificationResponse();

    useEffect(() => {
        SplashScreen.hideAsync();
        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener((lastNotificationResponse) => {
            const notideepLink = lastNotificationResponse.notification.request.content.data.deeplink;
            Linking.openURL(notideepLink);
        });

        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, [lastNotificationResponse]);


    return (
        <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={(error, stackTrace) => {
                console.error(`${error}, ${stackTrace}`);
            }}
        >
            <Stack>
                <Stack.Screen name="index" options={{headerShown: false}}/>
            </Stack>
        </ErrorBoundary>
    );
}
