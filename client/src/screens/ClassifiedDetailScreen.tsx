import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Image,
    Dimensions, Linking, StyleSheet, Modal, Alert, Share, StatusBar
} from 'react-native';
import { ArrowLeft, Phone, Share2, MapPin, Tag, X, Camera, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const CATEGORY_COLORS: Record<string, string> = {
    'Eletrônicos': '#3b82f6', 'Móveis': '#f59e0b', 'Serviços': '#10b981',
    'Imóveis': '#8b5cf6', 'Esportes': '#ef4444', 'Roupas': '#ec4899', 'Outros': '#6b7280',
};

export default function ClassifiedDetailScreen({ route, navigation }: any) {
    const { ad } = route.params;
    const catColor = CATEGORY_COLORS[ad.category] || '#6b7280';
    const [viewerVisible, setViewerVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const images = ad.images || [];

    const openViewer = (index: number) => {
        setCurrentImageIndex(index);
        setViewerVisible(true);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Olha esse anúncio que encontrei no n8: ${ad.title}\nPreço: ${ad.price > 0 ? `R$ ${parseFloat(ad.price).toFixed(2)}` : 'A combinar'}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" translucent={true} backgroundColor="transparent" />

            {/* Custom Transparent Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.circleBtn}>
                    <ChevronLeft size={24} color="#1e293b" />
                </TouchableOpacity>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={handleShare} style={styles.circleBtn}>
                        <Share2 size={20} color="#1e293b" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Image Gallery */}
                <View style={styles.imageGallery}>
                    {images.length > 0 ? (
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={(e) => {
                                const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
                                setCurrentImageIndex(newIndex);
                            }}
                        >
                            {images.map((img: string, i: number) => (
                                <TouchableOpacity key={i} activeOpacity={0.9} onPress={() => openViewer(i)}>
                                    <Image source={{ uri: img }} style={styles.galleryImage} resizeMode="cover" />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    ) : (
                        <View style={styles.noImagePlace}>
                            <Camera size={64} color="#cbd5e1" />
                            <Text style={styles.noImageText}>Sem fotos para este anúncio</Text>
                        </View>
                    )}

                    {images.length > 1 && (
                        <View style={styles.imageIndicator}>
                            <Text style={styles.indicatorText}>{currentImageIndex + 1} / {images.length}</Text>
                        </View>
                    )}
                </View>

                {/* Content Area */}
                <View style={styles.content}>
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>
                            {ad.price > 0 ? `R$ ${parseFloat(ad.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'A combinar'}
                        </Text>
                        <View style={[styles.catBadge, { backgroundColor: catColor + '15' }]}>
                            <Tag size={12} color={catColor} />
                            <Text style={[styles.catBadgeText, { color: catColor }]}>{ad.category}</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>{ad.title}</Text>

                    <View style={styles.metaRow}>
                        <MapPin size={14} color="#94a3b8" />
                        <Text style={styles.metaText}>São Paulo - Bairro Exemplo</Text>
                        <View style={styles.metaDot} />
                        <Text style={styles.metaText}>Publicado há 2 dias</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Descrição</Text>
                        <Text style={styles.description}>{ad.description}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.sellerSection}>
                        <View style={styles.sellerAvatar}>
                            <Text style={styles.sellerInitials}>GD</Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 16 }}>
                            <Text style={styles.sellerName}>Geahn Daniel</Text>
                            <Text style={styles.sellerJoined}>Membro desde 2026</Text>
                        </View>
                        <TouchableOpacity style={styles.viewProfileBtn}>
                            <Text style={styles.viewProfileText}>Ver Perfil</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.footer}>
                <TouchableOpacity
                    onPress={() => Linking.openURL('tel:5511999990000')}
                    style={styles.callBtn}
                >
                    <Phone size={20} color="#1d4ed8" />
                    <Text style={styles.callBtnText}>Ligar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => Linking.openURL(`https://wa.me/5511999990000?text=Olá! Vi seu anúncio "${ad.title}" no n8 e tenho interesse.`)}
                    style={styles.chatBtn}
                >
                    <MessageCircle size={20} color="white" />
                    <Text style={styles.chatBtnText}>Chat via WhatsApp</Text>
                </TouchableOpacity>
            </View>

            {/* Viewer Modal */}
            <Modal visible={viewerVisible} animationType="fade" transparent>
                <View style={styles.viewerContainer}>
                    <TouchableOpacity onPress={() => setViewerVisible(false)} style={styles.closeViewer}>
                        <X size={28} color="white" />
                    </TouchableOpacity>
                    <Image source={{ uri: images[currentImageIndex] }} style={styles.viewerImage} resizeMode="contain" />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: '#ffffff',
    },
    header: {
        position: 'absolute', top: 56, left: 0, right: 0, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16,
    },
    circleBtn: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
    },
    headerActions: {
        flexDirection: 'row', gap: 12,
    },
    imageGallery: {
        width: width, height: 400, backgroundColor: '#f1f5f9',
    },
    galleryImage: {
        width: width, height: 400,
    },
    noImagePlace: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
    },
    noImageText: {
        fontSize: 14, color: '#94a3b8', fontWeight: '700', marginTop: 16,
    },
    imageIndicator: {
        position: 'absolute', bottom: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
    },
    indicatorText: {
        color: 'white', fontSize: 12, fontWeight: '800',
    },
    content: {
        padding: 24, borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -32, backgroundColor: 'white',
    },
    priceRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
    },
    price: {
        fontSize: 28, fontWeight: '900', color: '#1d4ed8',
    },
    catBadge: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, gap: 6,
    },
    catBadgeText: {
        fontSize: 12, fontWeight: '800', textTransform: 'uppercase',
    },
    title: {
        fontSize: 22, fontWeight: '800', color: '#0f172a', lineHeight: 30, marginBottom: 12,
    },
    metaRow: {
        flexDirection: 'row', alignItems: 'center', marginBottom: 24,
    },
    metaText: {
        fontSize: 13, color: '#94a3b8', fontWeight: '600', marginLeft: 4,
    },
    metaDot: {
        width: 4, height: 4, borderRadius: 2, backgroundColor: '#cbd5e1', marginHorizontal: 8,
    },
    divider: {
        height: 1, backgroundColor: '#f1f5f9', marginVertical: 24,
    },
    section: {
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18, fontWeight: '800', color: '#1e293b', marginBottom: 12,
    },
    description: {
        fontSize: 15, color: '#475569', lineHeight: 26, fontWeight: '500',
    },
    sellerSection: {
        flexDirection: 'row', alignItems: 'center',
    },
    sellerAvatar: {
        width: 48, height: 48, borderRadius: 16, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center',
    },
    sellerInitials: {
        fontSize: 18, fontWeight: '800', color: '#1d4ed8',
    },
    sellerName: {
        fontSize: 16, fontWeight: '800', color: '#1e293b',
    },
    sellerJoined: {
        fontSize: 12, color: '#94a3b8', fontWeight: '500', marginTop: 2,
    },
    viewProfileBtn: {
        backgroundColor: '#f8fafc', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12,
    },
    viewProfileText: {
        color: '#1d4ed8', fontSize: 13, fontWeight: '800',
    },
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 40, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#f1f5f9', flexDirection: 'row', gap: 12,
    },
    callBtn: {
        flex: 1, height: 60, borderRadius: 20, backgroundColor: '#eff6ff', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    },
    callBtnText: {
        color: '#1d4ed8', fontSize: 16, fontWeight: '800',
    },
    chatBtn: {
        flex: 2, height: 60, borderRadius: 20, backgroundColor: '#1d4ed8', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    },
    chatBtnText: {
        color: 'white', fontSize: 16, fontWeight: '800',
    },
    viewerContainer: {
        flex: 1, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center',
    },
    closeViewer: {
        position: 'absolute', top: 56, right: 24, zIndex: 10,
    },
    viewerImage: {
        width: width, height: '80%',
    },
});
