import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import axios from 'axios';

const FREEIMAGE_API_KEY = '8d20fe02198a847aa98d02a8901485a5';
const FREEIMAGE_URL = 'https://freeimage.host/api/1/upload';

export interface UploadResult {
    url: string;
    thumb: string;
    medium: string;
}

async function uploadBase64(base64: string): Promise<UploadResult | null> {
    try {
        const response = await axios.post(FREEIMAGE_URL, {
            key: FREEIMAGE_API_KEY,
            source: base64,
            format: 'json'
        }, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 60000,
        });

        if (response.data?.status_code === 200) {
            return {
                url: response.data.image.url,
                thumb: response.data.image.thumb?.url || response.data.image.url,
                medium: response.data.image.medium?.url || response.data.image.url,
            };
        }
        console.log('Upload response:', response.data);
        throw new Error(response.data?.error?.message || 'Upload failed');
    } catch (err: any) {
        console.log('Upload error:', err.response?.data || err.message);
        const msg = err.response?.data?.error?.message || err.message || 'Tente novamente.';
        Alert.alert('Erro no upload', msg);
        return null;
    }
}

async function resizeAndUpload(
    uri: string,
    options: { maxWidth?: number; maxHeight?: number; square?: boolean }
): Promise<UploadResult | null> {
    const { maxWidth = 1200, maxHeight = 1200, square = false } = options;

    try {
        let actions: ImageManipulator.Action[] = [];

        if (square) {
            actions.push({ resize: { width: maxWidth, height: maxWidth } });
        } else {
            actions.push({ resize: { width: maxWidth, height: maxHeight } });
        }

        const manipulated = await ImageManipulator.manipulateAsync(
            uri,
            actions,
            { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );

        if (!manipulated.base64) {
            Alert.alert('Erro', 'Não foi possível processar a imagem.');
            return null;
        }

        return uploadBase64(manipulated.base64);
    } catch (err: any) {
        console.log('Resize error:', err);
        Alert.alert('Erro', 'Falha ao processar a imagem.');
        return null;
    }
}

export async function pickAndUploadImage(
    options: { square?: boolean; maxSize?: number } = {}
): Promise<UploadResult | null> {
    if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permissão necessária', 'Permita o acesso à galeria.');
            return null;
        }
    }

    const { square = false, maxSize = 1200 } = options;

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: square,
        aspect: square ? [1, 1] : undefined,
        quality: 0.9,
        base64: false,
    });

    if (result.canceled || !result.assets?.[0]) return null;
    const asset = result.assets[0];

    return resizeAndUpload(asset.uri, {
        maxWidth: maxSize,
        maxHeight: maxSize,
        square
    });
}

export async function pickAndUploadLogo(): Promise<UploadResult | null> {
    if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permissão necessária', 'Permita o acesso à galeria.');
            return null;
        }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.9,
        base64: false,
    });

    if (result.canceled || !result.assets?.[0]) return null;
    const asset = result.assets[0];

    return resizeAndUpload(asset.uri, {
        maxWidth: 300,
        maxHeight: 200,
        square: false
    });
}

export async function pickAndUploadBanner(): Promise<UploadResult | null> {
    if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permissão necessária', 'Permita o acesso à galeria.');
            return null;
        }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.9,
        base64: false,
    });

    if (result.canceled || !result.assets?.[0]) return null;
    const asset = result.assets[0];

    return resizeAndUpload(asset.uri, {
        maxWidth: 1200,
        maxHeight: 1200,
        square: false
    });
}

export async function pickAndUploadAvatar(): Promise<UploadResult | null> {
    return pickAndUploadImage({ square: true, maxSize: 250 });
}
