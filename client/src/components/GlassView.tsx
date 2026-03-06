import React from 'react';
import { View, StyleSheet, Platform, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassViewProps extends ViewProps {
    intensity?: number;
    tint?: 'light' | 'dark' | 'default';
    borderRadius?: number;
    children?: React.ReactNode;
}

const GlassView: React.FC<GlassViewProps> = ({
    intensity = 30,
    tint = 'light',
    borderRadius = 24,
    children,
    style,
    ...props
}) => {
    if (Platform.OS === 'web') {
        return (
            <View
                style={[
                    styles.webGlass,
                    { borderRadius },
                    style,
                ]}
                {...props}
            >
                {children}
            </View>
        );
    }

    return (
        <View style={[{ borderRadius, overflow: 'hidden' }, style]} {...props}>
            <BlurView
                intensity={intensity}
                tint={tint}
                style={StyleSheet.absoluteFill}
            />
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    webGlass: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    content: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
});

export default GlassView;
