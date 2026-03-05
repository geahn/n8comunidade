import React from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Image,
    StyleSheet, Dimensions, Linking
} from 'react-native';
import { ArrowLeft, Clock, User, Share2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const CATEGORY_COLORS: Record<string, string> = {
    'Infraestrutura': '#3b82f6', 'Comunidade': '#10b981', 'Saúde': '#ef4444',
    'Eventos': '#f59e0b', 'Educação': '#8b5cf6', 'Segurança': '#6b7280',
};

export default function NewsDetailScreen({ route, navigation }: any) {
    const { item } = route.params;
    const catColor = CATEGORY_COLORS[item.category] || '#1d4ed8';

    return (
        <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            {/* Floating back button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={20} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>Notícias</Text>
                <TouchableOpacity style={styles.backBtn}>
                    <Share2 size={18} color="#64748b" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
                {/* Hero Image */}
                {item.image_url ? (
                    <View style={{ width: '100%', aspectRatio: 16/9 }}>
                        <Image source={{ uri: item.image_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    </View>
                ) : (
                    <View style={{ width: '100%', aspectRatio: 16/9, backgroundColor: catColor, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 64 }}>📰</Text>
                    </View>
                )}

                <View style={{ padding: 20 }}>
                    {/* Category badge */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <View style={{ backgroundColor: catColor + '20', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 }}>
                            <Text style={{ color: catColor, fontWeight: '700', fontSize: 13 }}>{item.category}</Text>
                        </View>
                    </View>

                    <Text style={{ fontSize: 26, fontWeight: '800', color: '#0f172a', lineHeight: 34, marginBottom: 14 }}>
                        {item.title}
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                        <View style={{ width: 32, height: 32, backgroundColor: catColor + '20', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                            <User size={16} color={catColor} />
                        </View>
                        <View>
                            <Text style={{ fontWeight: '700', color: '#1e293b', fontSize: 14 }}>{item.author_name || 'Redação'}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Clock size={12} color="#94a3b8" />
                                <Text style={{ color: '#94a3b8', fontSize: 12, marginLeft: 4 }}>{item.created_at}</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={{ color: '#334155', fontSize: 16, lineHeight: 28 }}>
                        {item.content}
                    </Text>

                    {/* Extra images */}
                    {item.extra_images?.map((img: string, i: number) => (
                        <Image key={i} source={{ uri: img }} style={{ width: '100%', height: 200, borderRadius: 16, marginTop: 16 }} resizeMode="cover" />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        height: 60, paddingTop: 52, backgroundColor: 'white',
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,
        borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 4,
        position: 'relative',
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 12, backgroundColor: '#f8fafc',
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: {
        flex: 1, textAlign: 'center', fontWeight: '700', color: '#1e293b', fontSize: 16,
    },
});
