import React, { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput,
    Modal, ActivityIndicator, Alert, RefreshControl, Image, StyleSheet, Dimensions
} from 'react-native';
import { Plus, Search, Tag, ChevronRight, X, DollarSign, FileText, ArrowLeft, Camera, Filter, Grid, List } from 'lucide-react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ImageUploadButton from '../components/ImageUploadButton';

const { width } = Dimensions.get('window');
import { API_URL } from '../api';


const CATEGORIES = ['Todos', 'Eletrônicos', 'Móveis', 'Serviços', 'Imóveis', 'Esportes', 'Roupas', 'Outros'];

const categoryColors: Record<string, string> = {
    'Eletrônicos': '#3b82f6', 'Móveis': '#f59e0b', 'Serviços': '#10b981',
    'Imóveis': '#8b5cf6', 'Esportes': '#ef4444', 'Roupas': '#ec4899', 'Outros': '#6b7280',
};

export default function ClassifiedsScreen({ navigation, route }: any) {
    const { token, selectedNeighborhood } = useAuth() as any;
    const [ads, setAds] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [refreshing, setRefreshing] = useState(false);

    const [form, setForm] = useState({
        title: '',
        description: '',
        price: '',
        category: 'Eletrônicos',
        images: [] as string[],
        videoUrl: ''
    });

    const fetchAds = async () => {
        if (!selectedNeighborhood?.id) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/ads?neighborhoodId=${selectedNeighborhood.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAds(res.data);
            setFiltered(res.data);
        } catch (err) {
            console.error('Error fetching ads:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (token && selectedNeighborhood?.id) fetchAds();
        if (route.params?.openForm) setShowForm(true);
    }, [route.params?.openForm, token, selectedNeighborhood]);

    useEffect(() => {
        let result = ads;
        if (selectedCategory !== 'Todos') result = result.filter(a => a.category === selectedCategory);
        if (search) result = result.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));
        setFiltered(result);
    }, [selectedCategory, search, ads]);

    const handleSubmit = async () => {
        if (!form.title || !form.description) return Alert.alert('Atenção', 'Preencha os campos obrigatórios.');
        setLoading(true);
        try {
            const payload = {
                title: form.title,
                description: form.description,
                price: parseFloat(form.price) || 0,
                category: form.category,
                images: form.images.filter(img => !!img)
            };

            await axios.post(`${API_URL}/api/ads`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert('✅ Sucesso', 'Seu anúncio foi publicado!');
            setForm({ title: '', description: '', price: '', category: 'Eletrônicos', images: [], videoUrl: '' });
            setShowForm(false);
            setCurrentStep(1);
            fetchAds();
        } catch (err: any) {
            Alert.alert('Erro', 'Não foi possível publicar seu anúncio agora.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={styles.headerTitle}>Classificados</Text>
                    <TouchableOpacity onPress={() => setShowForm(true)} style={styles.addBtn}>
                        <Plus size={22} color="white" />
                        <Text style={styles.addBtnText}>Anunciar</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.searchBar}>
                    <Search size={18} color="#94a3b8" />
                    <TextInput
                        placeholder="O que você está procurando?"
                        placeholderTextColor="#94a3b8"
                        value={search}
                        onChangeText={setSearch}
                        style={styles.searchInput}
                    />
                </View>
            </View>

            <View style={{ flex: 1 }}>
                {/* Categories */}
                <View style={styles.catContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
                        {CATEGORIES.map(cat => (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => setSelectedCategory(cat)}
                                style={[styles.catItem, selectedCategory === cat && styles.catItemActive]}
                            >
                                <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Ads List */}
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.adsList}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAds(); }} tintColor="#1d4ed8" />}
                >
                    {loading && ads.length === 0 ? (
                        <ActivityIndicator color="#1d4ed8" style={{ marginTop: 40 }} />
                    ) : filtered.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Tag size={48} color="#cbd5e1" />
                            <Text style={styles.emptyText}>Nenhum anúncio encontrado</Text>
                        </View>
                    ) : (
                        <View style={styles.grid}>
                            {filtered.map((ad) => (
                                <TouchableOpacity
                                    key={ad.id}
                                    onPress={() => navigation.navigate('ClassifiedDetail', { ad })}
                                    style={styles.adCard}
                                >
                                    <View style={styles.adImageContainer}>
                                        {ad.images && ad.images.length > 0 ? (
                                            <Image source={{ uri: ad.images[0] }} style={styles.adImage} resizeMode="cover" />
                                        ) : (
                                            <View style={styles.adPlaceholder}>
                                                <Camera size={24} color="#cbd5e1" />
                                            </View>
                                        )}
                                        <View style={[styles.catBadge, { backgroundColor: (categoryColors[ad.category] || '#6b7280') + 'CC' }]}>
                                            <Text style={styles.catBadgeText}>{ad.category}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.adInfo}>
                                        <Text style={styles.adTitle} numberOfLines={2}>{ad.title}</Text>
                                        <Text style={styles.adPrice}>
                                            {ad.price > 0 ? `R$ ${parseFloat(ad.price).toLocaleString('pt-BR')}` : 'A combinar'}
                                        </Text>
                                        <Text style={styles.adDate}>{new Date(ad.created_at).toLocaleDateString('pt-BR')}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </ScrollView>
            </View>

            {/* Create Ad Modal (Simplified Step-by-Step UI) */}
            <Modal visible={showForm} animationType="slide" transparent={false}>
                <View style={{ flex: 1, backgroundColor: 'white' }}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : setShowForm(false)} style={styles.modalBack}>
                            <ArrowLeft size={24} color="#1e293b" />
                        </TouchableOpacity>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={styles.modalTitle}>Novo Anúncio</Text>
                            <View style={styles.stepIndicator}>
                                {[1, 2, 3].map(s => (
                                    <View key={s} style={[styles.stepDot, currentStep >= s && styles.stepDotActive]} />
                                ))}
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => setShowForm(false)} style={styles.modalClose}>
                            <X size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.formContent}>
                        {currentStep === 1 && (
                            <View>
                                <Text style={styles.formLabel}>Qual o título?</Text>
                                <TextInput
                                    placeholder="Ex: iPhone 13 128GB"
                                    value={form.title}
                                    onChangeText={v => setForm(p => ({ ...p, title: v }))}
                                    style={styles.formInput}
                                />

                                <Text style={[styles.formLabel, { marginTop: 24 }]}>Em qual categoria?</Text>
                                <View style={styles.formCats}>
                                    {CATEGORIES.slice(1).map(cat => (
                                        <TouchableOpacity
                                            key={cat}
                                            onPress={() => setForm(p => ({ ...p, category: cat }))}
                                            style={[styles.formCatBtn, form.category === cat && styles.formCatBtnActive]}
                                        >
                                            <Text style={[styles.formCatText, form.category === cat && styles.formCatTextActive]}>{cat}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {currentStep === 2 && (
                            <View>
                                <Text style={styles.formLabel}>Adicione fotos</Text>
                                <View style={styles.photoGrid}>
                                    {[0, 1, 2, 3, 4, 5].map((index) => (
                                        <View key={index} style={styles.photoBox}>
                                            <ImageUploadButton
                                                imageUrl={form.images[index]}
                                                onUpload={(url) => {
                                                    const newImages = [...form.images];
                                                    newImages[index] = url;
                                                    setForm(p => ({ ...p, images: newImages }));
                                                }}
                                                onRemove={() => {
                                                    const newImages = [...form.images];
                                                    newImages.splice(index, 1);
                                                    setForm(p => ({ ...p, images: newImages }));
                                                }}
                                                size="medium"
                                                label="+"
                                            />
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {currentStep === 3 && (
                            <View>
                                <Text style={styles.formLabel}>Qual o valor?</Text>
                                <View style={styles.priceInputWrapper}>
                                    <Text style={styles.currencyPrefix}>R$</Text>
                                    <TextInput
                                        placeholder="0,00"
                                        value={form.price}
                                        onChangeText={v => setForm(p => ({ ...p, price: v }))}
                                        keyboardType="numeric"
                                        style={styles.priceInput}
                                    />
                                </View>

                                <Text style={[styles.formLabel, { marginTop: 24 }]}>Descrição detalhada</Text>
                                <TextInput
                                    placeholder="Descreva o que está vendendo..."
                                    value={form.description}
                                    onChangeText={v => setForm(p => ({ ...p, description: v }))}
                                    multiline
                                    style={styles.descInput}
                                />
                            </View>
                        )}
                    </ScrollView>

                    <View style={styles.formFooter}>
                        <TouchableOpacity
                            onPress={() => currentStep < 3 ? setCurrentStep(currentStep + 1) : handleSubmit()}
                            style={styles.submitBtn}
                        >
                            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitBtnText}>{currentStep === 3 ? 'Publicar agora' : 'Continuar'}</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: '#f8fafc',
    },
    header: {
        backgroundColor: '#ffffff', paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 5,
    },
    headerTop: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
    },
    headerTitle: {
        fontSize: 24, fontWeight: '900', color: '#0f172a',
    },
    addBtn: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#1d4ed8', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10, gap: 8,
    },
    addBtnText: {
        color: 'white', fontWeight: '800', fontSize: 14,
    },
    searchBar: {
        backgroundColor: '#f1f5f9', borderRadius: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 50,
    },
    searchInput: {
        flex: 1, marginLeft: 10, color: '#1e293b', fontWeight: '600', fontSize: 15,
    },
    catContainer: {
        paddingVertical: 16,
    },
    catScroll: {
        paddingHorizontal: 20,
    },
    catItem: {
        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, backgroundColor: 'white', marginRight: 10, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, elevation: 1,
    },
    catItemActive: {
        backgroundColor: '#1d4ed8',
    },
    catText: {
        fontSize: 14, fontWeight: '700', color: '#64748b',
    },
    catTextActive: {
        color: 'white',
    },
    adsList: {
        paddingHorizontal: 20, paddingBottom: 100,
    },
    emptyState: {
        alignItems: 'center', marginTop: 100,
    },
    emptyText: {
        color: '#94a3b8', fontSize: 16, fontWeight: '600', marginTop: 16,
    },
    grid: {
        flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
    },
    adCard: {
        width: (width - 50) / 2, backgroundColor: 'white', borderRadius: 24, marginBottom: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#f1f5f9',
    },
    adImageContainer: {
        width: '100%', height: 140, position: 'relative',
    },
    adImage: {
        width: '100%', height: '100%',
    },
    adPlaceholder: {
        width: '100%', height: '100%', backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center',
    },
    catBadge: {
        position: 'absolute', top: 10, left: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
    },
    catBadgeText: {
        color: 'white', fontSize: 10, fontWeight: '900', textTransform: 'uppercase',
    },
    adInfo: {
        padding: 12,
    },
    adTitle: {
        fontSize: 14, fontWeight: '700', color: '#1e293b', height: 40,
    },
    adPrice: {
        fontSize: 18, fontWeight: '900', color: '#1d4ed8', marginTop: 6,
    },
    adDate: {
        fontSize: 11, color: '#cbd5e1', marginTop: 6, fontWeight: '600',
    },
    modalHeader: {
        flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
    },
    modalTitle: {
        fontSize: 18, fontWeight: '900', color: '#0f172a',
    },
    stepIndicator: {
        flexDirection: 'row', gap: 6, marginTop: 8,
    },
    stepDot: {
        width: 16, height: 4, borderRadius: 2, backgroundColor: '#f1f5f9',
    },
    stepDotActive: {
        backgroundColor: '#1d4ed8',
    },
    formContent: {
        padding: 24,
    },
    formLabel: {
        fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 12,
    },
    formInput: {
        backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, fontSize: 16, color: '#1e293b', borderWidth: 1, borderColor: '#f1f5f9',
    },
    formCats: {
        flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    },
    formCatBtn: {
        paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9',
    },
    formCatBtnActive: {
        backgroundColor: '#eff6ff', borderColor: '#1d4ed8',
    },
    formCatText: {
        fontSize: 14, fontWeight: '700', color: '#64748b',
    },
    formCatTextActive: {
        color: '#1d4ed8',
    },
    photoGrid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: 12,
    },
    photoBox: {
        width: '30%', aspectRatio: 1,
    },
    priceInputWrapper: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: '#f1f5f9',
    },
    currencyPrefix: {
        fontSize: 18, fontWeight: '800', color: '#1d4ed8', marginRight: 8,
    },
    priceInput: {
        flex: 1, height: 60, fontSize: 18, fontWeight: '800', color: '#1e293b',
    },
    descInput: {
        backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, fontSize: 16, color: '#1e293b', borderWidth: 1, borderColor: '#f1f5f9', minHeight: 150, textAlignVertical: 'top',
    },
    formFooter: {
        padding: 24, paddingBottom: 40, borderTopWidth: 1, borderTopColor: '#f1f5f9',
    },
    submitBtn: {
        backgroundColor: '#1d4ed8', borderRadius: 20, height: 60, alignItems: 'center', justifyContent: 'center',
    },
    submitBtnText: {
        color: 'white', fontSize: 16, fontWeight: '800',
    },
    modalBack: {
        width: 44, height: 44, borderRadius: 14, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center',
    },
    modalClose: {
        width: 44, height: 44, borderRadius: 14, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center',
    },
});
