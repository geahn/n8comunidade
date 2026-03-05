import React from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { Camera, ImagePlus, X } from 'lucide-react-native';
import { pickAndUploadImage } from '../services/imageUpload';

interface Props {
    imageUrl?: string;
    onUpload: (url: string) => void;
    onRemove?: () => void;
    size?: 'small' | 'medium' | 'large' | 'banner';
    label?: string;
    shape?: 'square' | 'circle';
}

const SIZES = {
    small: { width: 60, height: 60, iconSize: 18 },
    medium: { width: 100, height: 100, iconSize: 22 },
    large: { width: 140, height: 140, iconSize: 28 },
    banner: { width: '100%' as any, height: 180, iconSize: 28 },
};

export default function ImageUploadButton({ imageUrl, onUpload, onRemove, size = 'medium', label, shape = 'square' }: Props) {
    const [loading, setLoading] = React.useState(false);
    const dims = SIZES[size];
    const borderRadius = shape === 'circle' ? 999 : (size === 'banner' ? 16 : 16);

    const handlePick = async () => {
        setLoading(true);
        try {
            const result = await pickAndUploadImage();
            if (result) onUpload(result.url);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ alignItems: 'center' }}>
            <TouchableOpacity onPress={handlePick} disabled={loading}
                style={{
                    width: dims.width, height: dims.height, borderRadius,
                    backgroundColor: '#f1f5f9', borderWidth: 2, borderColor: '#e2e8f0',
                    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                }}>
                {loading ? (
                    <ActivityIndicator color="#1d4ed8" />
                ) : imageUrl ? (
                    <>
                        <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                        {onRemove && (
                            <TouchableOpacity onPress={onRemove}
                                style={{ position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10, padding: 4 }}>
                                <X size={12} color="white" />
                            </TouchableOpacity>
                        )}
                    </>
                ) : (
                    <View style={{ alignItems: 'center' }}>
                        <ImagePlus size={dims.iconSize} color="#94a3b8" />
                        {size !== 'small' && <Text style={{ color: '#94a3b8', fontSize: 11, marginTop: 4, textAlign: 'center' }}>
                            {label || 'Adicionar foto'}
                        </Text>}
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
}
