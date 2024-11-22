import React, {FC, useEffect, useState} from 'react';
import NfcManager, {Ndef, NfcTech, NfcEvents, TagEvent} from 'react-native-nfc-manager';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

export default function EvChargeReadNfcController() {
    const [hasNfc, setHasNc] = useState<boolean | null>(null);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        async function checkNfc() {
            const supported = await NfcManager.isSupported();
            if (supported) {
                NfcManager.start();
            }
            setHasNc(supported);
        }

        checkNfc();
    }, []);

    if (hasNfc == null) {
        return null;
    } else if (!hasNfc) {
        return <Text style={styles.noNfcText}>Your device doesnt support NFC</Text>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.historyContainer}>
                <Text style={styles.historyTitle}>Tags:</Text>
                <ScrollView>
                    {history.map((item, index) => (
                        <View key={index} style={styles.historyItem}>
                            {Object.keys(item).map((key, idx) => (
                                <View key={idx} style={styles.row}>
                                    <Text style={styles.key}>{key}:</Text>
                                    <Text style={styles.value}>{item[key]}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </ScrollView>
            </View>
            <TagScanner onTagFound={(value: any) => {
                setHistory([...history, value]);
            }}/>
        </View>
    );
};

interface TagScannerProps {
    onTagFound: (value: any) => void;
}

const TagScanner: FC<TagScannerProps> = ({onTagFound}) => {
    const [scanning, setScanning] = useState<boolean>(false);

    async function readNdef() {
        try {
            setScanning(true);

            await NfcManager.requestTechnology([
                NfcTech.Ndef,
                // NfcTech.NfcB,
                // NfcTech.NfcF,
                // NfcTech.NfcV,
                // NfcTech.IsoDep,
                NfcTech.MifareClassic,
                NfcTech.MifareUltralight
                // NfcTech.MifareIOS,
                // NfcTech.Iso15693IOS,
                // NfcTech.FelicaIOS,
                // NfcTech.NdefFormatable,
            ]);


            // The resolved tag object
            const tag = await NfcManager.getTag();
            console.log('Tag found: ', tag);
            console.log('tag.ndefMessage: ', tag?.ndefMessage);

            // Check if the tag contains NDEF messages
            if (tag?.ndefMessage) {
                // Iterate over each NDEF record
                tag.ndefMessage.forEach((record, i) => {
                    // Decode payload of each record
                    const payload = Ndef.text.decodePayload(record.payload);
                    console.log('payload: ', record.payload);
                    console.log('payload decoded: ', payload);
                    const log = {id: tag.id, techTypes: tag.techTypes, text: payload};
                    onTagFound(log);
                });
            } else {
                onTagFound(tag);
                console.log('No NDEF message found on tag');
            }
        } catch (ex) {
            console.warn('Oops!', ex);
        } finally {
            // Stop the NFC scanning
            await NfcManager.cancelTechnologyRequest();
            setScanning(false);
        }
    }

    return (
        <View style={styles.scannerContainer}>
            {scanning && <Text style={styles.scanningText}>Scanning...</Text>}
            {!scanning && (
                <TouchableOpacity
                    onPress={readNdef}
                    style={styles.scanButton}
                >
                    <Text style={styles.buttonText}>Start Tag Scan</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 120,
        flex: 1,
        backgroundColor: '#f0f0f0',
        padding: 20,
    },
    noNfcText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 50,
    },
    historyContainer: {
        marginBottom: 20,
    },
    historyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    historyItem: {
        marginBottom: 5,
        borderColor: 'black',
        borderWidth: 1,
        padding: 8

    },
    scannerContainer: {
        alignItems: 'center',
    },
    scanButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 5,
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    scanningText: {
        fontSize: 16,
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        marginVertical: 5,
        paddingHorizontal: 10,
    },
    key: {
        fontWeight: 'bold',
        width: '30%',
    },
    value: {
        flex: 1,
        marginLeft: 10,
        overflow: 'visible'
    },
});