import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput,
    Modal, Alert, RefreshControl, Dimensions, Image
} from 'react-native';
import { Plus, Search, Clock, ChevronRight, X, FileText, Tag } from 'lucide-react-native';
import ImageUploadButton from '../components/ImageUploadButton';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

const MOCK_NEWS = [
    { id: '1', title: 'Nova Praça de Lazer é Inaugurada no Centro', content: 'A prefeitura municipal inaugurou nesta sexta-feira a nova praça de lazer no coração do bairro, com pista de skate, academia ao ar livre e playground. O investimento foi conquistado após forte mobilização da Associação de Moradores ao longo de dois anos.', category: 'Infraestrutura', author_name: 'Prefeitura Municipal', created_at: '04/03/2026', status: 'published', image_url: 'https://images.unsplash.com/photo-1551731409-43eb3e517a1a?w=600&q=80' },
    { id: '2', title: 'Mutirão de Limpeza Reúne 200 Voluntários', content: 'Uma mobilização incrível tomou conta do bairro neste sábado. Duzentos moradores saíram às ruas para transformar os espaços coletivos, recolhendo toneladas de lixo e revitalizando as calçadas.', category: 'Comunidade', author_name: 'Associação de Moradores', created_at: '03/03/2026', status: 'published', image_url: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&q=80' },
    { id: '3', title: 'Posto de Saúde Amplia Horário de Atendimento', content: 'A partir da próxima semana, o posto de saúde do bairro atenderá das 7h às 20h, inclusive aos sábados. Especialidades como pediatria e ginecologia também foram ampliadas com novos médicos.', category: 'Saúde', author_name: 'Secretaria de Saúde', created_at: '02/03/2026', status: 'published', image_url: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&q=80' },
    { id: '4', title: 'Festival Gastronômico Reúne 50 Restaurantes', content: 'O maior evento gastronômico da região acontece no próximo fim de semana. Entrada gratuita, com apresentações musicais e barracas de comida típica de todo o Brasil.', category: 'Eventos', author_name: 'Organização do Festival', created_at: '01/03/2026', status: 'published', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80' },
    { id: '5', title: 'Escola Municipal Ganha Novos Computadores', content: 'Doação de 40 computadores modernos vai beneficiar 800 alunos da escola municipal. O laboratório será inaugurado na próxima segunda-feira com aulas de programação e robótica.', category: 'Educação', author_name: 'Secretaria de Educação', created_at: '28/02/2026', status: 'published', image_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80' },
];

const CATEGORY_COLORS: Record<string, string> = {
    'Infraestrutura': '#3b82f6', 'Comunidade': '#10b981', 'Saúde': '#ef4444',
    'Eventos': '#f59e0b', 'Educação': '#8b5cf6', 'Segurança': '#6b7280',
};

export default function NewsScreen({ navigation }: any) {
    const { token } = useAuth() as any;
    const [news, setNews] = useState(MOCK_NEWS);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [form, setForm] = useState({ title: '', content: '', category: 'Comunidade', image_url: '' });

    const filtered = news.filter(n =>
        !search || n.title.toLowerCase().includes(search.toLowerCase())
    );

    const handleSubmit = () => {
        if (!form.title || !form.content) return Alert.alert('Preencha título e conteúdo.');
        const newItem = {
            id: String(Date.now()),
            ...form,
            author_name: 'Você',
            created_at: new Date().toISOString().split('T')[0],
            status: 'pending',
        };
        setNews(prev => [newItem, ...prev]);
        setForm({ title: '', content: '', category: 'Comunidade', image_url: '' });
        setShowForm(false);
        Alert.alert('✅ Notícia sugerida!', 'Sua sugestão será revisada pelo administrador do bairro.');
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            {/* Header */}
            <View style={{ backgroundColor: '#1d4ed8', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>Notícias</Text>
                    <TouchableOpacity onPress={() => setShowForm(true)}
                        style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 10 }}>
                        <Plus size={22} color="white" />
                    </TouchableOpacity>
                </View>
                <View style={{ backgroundColor: 'white', borderRadius: 14, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10 }}>
                    <Search size={18} color="#94a3b8" />
                    <TextInput placeholder="Buscar notícias..." value={search} onChangeText={setSearch}
                        style={{ flex: 1, marginLeft: 8, color: '#1e293b' }} />
                </View>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}>
                <View style={{ flexDirection: isMobile ? 'column' : 'row', flexWrap: 'wrap', gap: 16 }}>
                    {filtered.map(item => (
                        <TouchableOpacity key={item.id} onPress={() => navigation.navigate('NewsDetail', { item })}
                            style={{ width: isMobile ? '100%' : '48%', backgroundColor: 'white', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
                            
                            {item.image_url && (
                                <View style={{ width: '100%', aspectRatio: 16/9 }}>
                                    <Image source={{ uri: item.image_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                </View>
                            )}

                            <View style={{ padding: 16 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                    <View style={{
                                        backgroundColor: (CATEGORY_COLORS[item.category] || '#6b7280') + '20',
                                        borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginRight: 8
                                    }}>
                                        <Text style={{ color: CATEGORY_COLORS[item.category] || '#6b7280', fontSize: 11, fontWeight: '700' }}>{item.category}</Text>
                                    </View>
                                    {item.status === 'pending' && (
                                        <View style={{ backgroundColor: '#fef3c7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                                            <Text style={{ color: '#d97706', fontSize: 11, fontWeight: '700' }}>Pendente</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={{ fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 6 }}>{item.title}</Text>
                                <Text numberOfLines={2} style={{ color: '#64748b', fontSize: 13 }}>{item.content}</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Clock size={13} color="#94a3b8" />
                                        <Text style={{ color: '#94a3b8', fontSize: 12, marginLeft: 4 }}>{item.created_at} • {item.author_name}</Text>
                                    </View>
                                    <Text style={{ color: '#1d4ed8', fontSize: 12, fontWeight: '600' }}>Ler mais</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Suggest News Modal */}
            <Modal visible={showForm} animationType="slide" transparent>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1e293b' }}>Sugerir Notícia</Text>
                            <TouchableOpacity onPress={() => setShowForm(false)}><X size={24} color="#64748b" /></TouchableOpacity>
                        </View>
                        <Text style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>Sua sugestão será analisada pelo administrador do bairro antes de ser publicada.</Text>

                        {[
                            { key: 'title', placeholder: 'Título da notícia' },
                            { key: 'content', placeholder: 'Descreva o que aconteceu...', multiline: true },
                        ].map(field => (
                            <View key={field.key} style={{
                                backgroundColor: '#f8fafc', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
                                marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0'
                            }}>
                                <TextInput placeholder={field.placeholder} value={(form as any)[field.key]}
                                    onChangeText={v => setForm(p => ({ ...p, [field.key]: v }))}
                                    multiline={field.multiline} numberOfLines={field.multiline ? 4 : 1}
                                    style={{ color: '#1e293b', textAlignVertical: field.multiline ? 'top' : 'center', minHeight: field.multiline ? 88 : undefined }} />
                            </View>
                        ))}

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                            {Object.keys(CATEGORY_COLORS).map(cat => (
                                <TouchableOpacity key={cat} onPress={() => setForm(p => ({ ...p, category: cat }))}
                                    style={{ backgroundColor: form.category === cat ? '#1d4ed8' : '#f1f5f9', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 }}>
                                    <Text style={{ color: form.category === cat ? 'white' : '#64748b', fontWeight: '600', fontSize: 13 }}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TouchableOpacity onPress={handleSubmit}
                            style={{ backgroundColor: '#1d4ed8', borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}>
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Enviar Sugestão</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
