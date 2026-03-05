import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput, Alert, Animated } from 'react-native';
import { X, Tag, Newspaper, Store } from 'lucide-react-native';

interface Props {
    visible: boolean;
    onClose: () => void;
    navigation: any;
}

export default function PublishHubModal({ visible, onClose, navigation }: Props) {
    const [step, setStep] = useState<'hub' | 'classified' | 'news' | 'shopkeeper'>('hub');
    const [form, setForm] = useState({ title: '', description: '', price: '', category: 'Outros' });

    const resetAndClose = () => {
        setStep('hub');
        setForm({ title: '', description: '', price: '', category: 'Outros' });
        onClose();
    };

    const handleSubmitClassified = () => {
        if (!form.title) return Alert.alert('Informe o título');
        Alert.alert('✅ Anúncio publicado!', 'Seu classificado já está disponível no bairro.');
        resetAndClose();
    };

    const handleSubmitNews = () => {
        if (!form.title || !form.description) return Alert.alert('Preencha todos os campos');
        Alert.alert('✅ Notícia enviada!', 'Sua sugestão será revisada pelo administrador do bairro.');
        resetAndClose();
    };

    const handleShopkeeper = () => {
        Alert.alert('✅ Solicitação enviada!', 'Entraremos em contato em até 24 horas para concluir seu cadastro como lojista.');
        resetAndClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={resetAndClose}>
            <TouchableOpacity activeOpacity={1} onPress={resetAndClose}
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}>
                <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}>
                    <View style={{ backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24 }}>

                        {/* Hub Selection */}
                        {step === 'hub' && (
                            <>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1e293b' }}>O que deseja publicar?</Text>
                                    <TouchableOpacity onPress={resetAndClose}><X size={24} color="#94a3b8" /></TouchableOpacity>
                                </View>
                                <Text style={{ color: '#64748b', marginBottom: 24 }}>Escolha uma opção abaixo</Text>

                                {/* Option 1: Classified */}
                                <TouchableOpacity onPress={() => { onClose(); navigation.navigate('Classificados', { openForm: true }); }}
                                    style={{ backgroundColor: '#eff6ff', borderRadius: 20, padding: 20, marginBottom: 12, flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ backgroundColor: '#1d4ed8', width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                                        <Tag size={26} color="white" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 17, fontWeight: '700', color: '#1e293b' }}>📢 Publicar Classificado</Text>
                                        <Text style={{ color: '#64748b', fontSize: 13, marginTop: 3 }}>Venda, alugue ou ofereça serviços para o bairro</Text>
                                    </View>
                                </TouchableOpacity>

                                {/* Option 2: News */}
                                <TouchableOpacity onPress={() => setStep('news')}
                                    style={{ backgroundColor: '#fef3c7', borderRadius: 20, padding: 20, marginBottom: 12, flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ backgroundColor: '#f59e0b', width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                                        <Newspaper size={26} color="white" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 17, fontWeight: '700', color: '#1e293b' }}>📰 Sugerir Notícia</Text>
                                        <Text style={{ color: '#64748b', fontSize: 13, marginTop: 3 }}>Compartilhe algo importante com a comunidade</Text>
                                    </View>
                                </TouchableOpacity>

                                {/* Option 3: Become Shopkeeper */}
                                <TouchableOpacity onPress={() => setStep('shopkeeper')}
                                    style={{
                                        borderRadius: 20, padding: 20, marginBottom: 8, flexDirection: 'row', alignItems: 'center',
                                        borderWidth: 2, borderColor: '#10b981', backgroundColor: '#f0fdf4'
                                    }}>
                                    <View style={{ backgroundColor: '#10b981', width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                                        <Store size={26} color="white" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 17, fontWeight: '700', color: '#1e293b' }}>🏪 Cadastrar Loja</Text>
                                            <View style={{ backgroundColor: '#10b981', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 }}>
                                                <Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>GRÁTIS</Text>
                                            </View>
                                        </View>
                                        <Text style={{ color: '#64748b', fontSize: 13, marginTop: 3 }}>Abra sua loja digital no bairro e venda mais</Text>
                                    </View>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* Classified Form */}
                        {step === 'classified' && (
                            <>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                                    <TouchableOpacity onPress={() => setStep('hub')} style={{ marginRight: 12 }}>
                                        <Text style={{ color: '#1d4ed8', fontSize: 16 }}>←</Text>
                                    </TouchableOpacity>
                                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1e293b' }}>Novo Classificado</Text>
                                </View>
                                {['title', 'price', 'description'].map((key) => (
                                    <View key={key} style={{ backgroundColor: '#f8fafc', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' }}>
                                        <TextInput
                                            placeholder={key === 'title' ? 'Título' : key === 'price' ? 'Preço (R$)' : 'Descrição...'}
                                            value={(form as any)[key]} onChangeText={v => setForm(p => ({ ...p, [key]: v }))}
                                            multiline={key === 'description'} keyboardType={key === 'price' ? 'numeric' : 'default'}
                                            style={{ color: '#1e293b', minHeight: key === 'description' ? 72 : undefined, textAlignVertical: key === 'description' ? 'top' : 'center' }}
                                        />
                                    </View>
                                ))}
                                <TouchableOpacity onPress={handleSubmitClassified}
                                    style={{ backgroundColor: '#1d4ed8', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 }}>
                                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Publicar Anúncio</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* News Form */}
                        {step === 'news' && (
                            <>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                                    <TouchableOpacity onPress={() => setStep('hub')} style={{ marginRight: 12 }}>
                                        <Text style={{ color: '#1d4ed8', fontSize: 16 }}>←</Text>
                                    </TouchableOpacity>
                                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1e293b' }}>Sugerir Notícia</Text>
                                </View>
                                <Text style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>Será revisada pelo administrador antes de aparecer no feed.</Text>
                                {[
                                    { key: 'title', placeholder: 'Título da notícia' },
                                    { key: 'description', placeholder: 'O que aconteceu? Descreva com detalhes...', multiline: true }
                                ].map(f => (
                                    <View key={f.key} style={{ backgroundColor: '#f8fafc', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' }}>
                                        <TextInput placeholder={f.placeholder} value={(form as any)[f.key]}
                                            onChangeText={v => setForm(p => ({ ...p, [f.key]: v }))}
                                            multiline={f.multiline} style={{ color: '#1e293b', minHeight: f.multiline ? 80 : undefined, textAlignVertical: f.multiline ? 'top' : 'center' }} />
                                    </View>
                                ))}
                                <TouchableOpacity onPress={handleSubmitNews}
                                    style={{ backgroundColor: '#f59e0b', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 }}>
                                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Enviar Sugestão</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* Shopkeeper CTA */}
                        {step === 'shopkeeper' && (
                            <>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                    <TouchableOpacity onPress={() => setStep('hub')} style={{ marginRight: 12 }}>
                                        <Text style={{ color: '#1d4ed8', fontSize: 16 }}>←</Text>
                                    </TouchableOpacity>
                                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1e293b' }}>Abra sua Loja</Text>
                                </View>
                                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                                    <Text style={{ fontSize: 48, marginBottom: 8 }}>🏪</Text>
                                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#1e293b', textAlign: 'center', marginBottom: 8 }}>
                                        Leve seu negócio para o bairro!
                                    </Text>
                                    <Text style={{ color: '#64748b', textAlign: 'center', lineHeight: 22 }}>
                                        Cadastre sua loja gratuitamente e alcance centenas de vizinhos que estão procurando exatamente o que você oferece.
                                    </Text>
                                </View>
                                {['✅ Vitrine digital gratuita', '✅ Catálogo de produtos ilimitado', '✅ Contato direto por WhatsApp', '✅ Visibilidade para toda a comunidade'].map(b => (
                                    <View key={b} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                        <Text style={{ fontSize: 14, color: '#1e293b' }}>{b}</Text>
                                    </View>
                                ))}
                                <TouchableOpacity onPress={handleShopkeeper}
                                    style={{ backgroundColor: '#10b981', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 16 }}>
                                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Quero cadastrar minha loja!</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}
