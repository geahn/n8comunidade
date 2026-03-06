import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { Home, ShoppingBag, MessageCircle, Newspaper, Plus } from 'lucide-react-native';
import GlassView from './GlassView';

const { width } = Dimensions.get('window');

interface FloatingNavProps {
    activeTab: string;
    onTabPress: (tab: string) => void;
    onPlusPress: () => void;
}

const FloatingNav: React.FC<FloatingNavProps> = ({ activeTab, onTabPress, onPlusPress }) => {
    const tabs = [
        { id: 'Bairro', icon: Home, label: 'Bairro' },
        { id: 'Negócios', icon: ShoppingBag, label: 'Negócios' },
        { id: 'Plus', isPlus: true },
        { id: 'Social', icon: MessageCircle, label: 'Social' },
        { id: 'Notícias', icon: Newspaper, label: 'Notícias' },
    ];

    return (
        <View style={styles.container}>
            <GlassView intensity={40} borderRadius={40} style={styles.navBar}>
                {tabs.map((tab) => {
                    if (tab.isPlus) {
                        return (
                            <TouchableOpacity
                                key="plus"
                                onPress={onPlusPress}
                                style={styles.plusButton}
                                activeOpacity={0.8}
                            >
                                <View style={styles.plusinner}>
                                    <Plus size={28} color="white" />
                                </View>
                            </TouchableOpacity>
                        );
                    }

                    const Icon = tab.icon!;
                    const isActive = activeTab === tab.id;

                    return (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => onTabPress(tab.id)}
                            style={styles.tabItem}
                            activeOpacity={0.6}
                        >
                            <Icon
                                size={22}
                                color={isActive ? '#1E88E5' : '#717182'}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <Text
                                style={[
                                    styles.tabLabel,
                                    { color: isActive ? '#1E88E5' : '#717182', fontWeight: isActive ? '700' : '500' },
                                ]}
                            >
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </GlassView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 40 : 24,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 20,
        zIndex: 1000,
    },
    navBar: {
        flexDirection: 'row',
        height: 70,
        width: Platform.OS === 'web' ? Math.min(width - 40, 450) : width - 40,
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
            },
            android: {
                elevation: 10,
            },
            web: {
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            }
        }),
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    tabLabel: {
        fontSize: 10,
        marginTop: 4,
    },
    plusButton: {
        top: -20,
        zIndex: 1001,
    },
    plusinner: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#1E88E5',
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#1E88E5',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
            web: {
                boxShadow: '0 8px 20px rgba(30, 136, 229, 0.3)',
            }
        }),
    },
});

export default FloatingNav;
