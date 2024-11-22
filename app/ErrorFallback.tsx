import React from 'react';
import {Text, View, Button} from 'react-native';
import {FallbackComponentProps} from "react-native-error-boundary";


const ErrorFallback: React.FC<FallbackComponentProps> = ({error, resetError}) => (
    <View
        style={{
            flex: 1,
            borderWidth: 2,
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex'
        }}
    >
        <View
            style={{
                padding: 50
            }}
        >
            <Text>An error occurred!</Text>
            <Text>{error.message}</Text>
            <Button title="Try again" onPress={resetError}/>
        </View>
    </View>
);

export default ErrorFallback;
