import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Phone, MapPin, Heart, Shield, Wrench, Stethoscope, ChevronRight } from 'lucide-react-native';

const CONTACTS = [
    { id: '1', category: 'Saúde', name: 'UBS Bairro Exemplo', phone: '(11) 3333-1111', address: 'Rua da Saúde, 100', icon: '🏥' },
    { id: '2', category: 'Saúde', name: 'Hospital Municipal', phone: '(11) 3333-2222', address: 'Av. Central, 500', icon: '🏨' },
    { id: '3', category: 'Saúde', name: 'SAMU', phone: '192', address: '24 horas', icon: '🚑' },
    { id: '4', category: 'Segurança', name: 'Polícia Militar (14º BPM)', phone: '190', address: 'Rua da Segurança, 200', icon: '👮' },
    { id: '5', category: 'Segurança', name: 'Corpo de Bombeiros', phone: '193', address: 'Av. dos Bombeiros, 300', icon: '🚒' },
    { id: '6', category: 'Segurança', name: 'Guarda Municipal', phone: '(11) 3333-3333', address: 'Praça Central, s/n', icon: '🏛️' },
    { id: '7', category: 'Serviços', name: 'Subprefeitura', phone: '(11) 3333-4444', address: 'Av. Cívica, 400', icon: '🏢' },
    { id: '8', category: 'Serviços', name: 'SABESP (Água e Esgoto)', phone: '195', address: '24 horas', icon: '💧' },
    { id: '9', category: 'Serviços', name: 'Enel (Energia Elétrica)', phone: '0800 722 2196', address: '24 horas', icon: '⚡' },
    { id: '10', category: 'Serviços', name: 'PROCON Local', phone: '(11) 3333-5555', address: 'Rua do Consumidor, 10', icon: '⚖️' },
    { id: '11', category: 'Social', name: 'CRAS Bairro', phone: '(11) 3333-6666', address: 'Rua Social, 150', icon: '🤝' },
    { id: '12', category: 'Social', name: 'Conselho Tutelar', phone: '(11) 3333-7777', address: 'Av. da Família, 50', icon: '👶' },
];

const CATEGORIES = [
    { name: 'Saúde', color: '#ef4444', bg: '#fef2f2', emoji: '🏥' },
    { name: 'Segurança', color: '#3b82f6', bg: '#eff6ff', emoji: '🛡️' },
    { name: 'Serviços', color: '#f59e0b', bg: '#fffbeb', emoji: '🔧' },
    { name: 'Social', color: '#10b981', bg: '#f0fdf4', emoji: '🤝' },
];

export default function SocialScreen() {
    const [activeCategory, setActiveCategory] = useState('Saúde');

    const filtered = CONTACTS.filter(c => c.category === activeCategory);
    const activeStyle = CATEGORIES.find(c => c.name === activeCategory);

    return (
        <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            <View style={{ backgroundColor: '#1d4ed8', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 }}>
                <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>Social</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>Contatos úteis do seu bairro</Text>
            </View>

            {/* Category tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16, paddingVertical: 14, flexGrow: 0 }}>
                {CATEGORIES.map(cat => (
                    <TouchableOpacity key={cat.name} onPress={() => setActiveCategory(cat.name)}
                        style={{
                            backgroundColor: activeCategory === cat.name ? cat.color : 'white',
                            borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginRight: 10,
                            flexDirection: 'row', alignItems: 'center',
                            shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2
                        }}>
                        <Text style={{ fontSize: 16, marginRight: 6 }}>{cat.emoji}</Text>
                        <Text style={{ color: activeCategory === cat.name ? 'white' : '#64748b', fontWeight: '700', fontSize: 14 }}>{cat.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}>
                {/* Emergency Banner */}
                <View style={{ backgroundColor: '#fef2f2', borderRadius: 16, padding: 16, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#ef4444', flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 24, marginRight: 12 }}>🆘</Text>
                    <View>
                        <Text style={{ color: '#dc2626', fontWeight: '700', fontSize: 14 }}>Emergência? Ligue agora</Text>
                        <Text style={{ color: '#dc2626', fontSize: 13 }}>SAMU 192 • Bombeiros 193 • PM 190</Text>
                    </View>
                </View>

                {filtered.map(contact => (
                    <View key={contact.id} style={{
                        backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 10,
                        shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{
                                width: 52, height: 52, backgroundColor: activeStyle?.bg || '#f8fafc',
                                borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14
                            }}>
                                <Text style={{ fontSize: 24 }}>{contact.icon}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 15, fontWeight: '700', color: '#1e293b' }}>{contact.name}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                                    <MapPin size={12} color="#94a3b8" />
                                    <Text style={{ color: '#94a3b8', fontSize: 12, marginLeft: 4 }}>{contact.address}</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => Linking.openURL(`tel:${contact.phone.replace(/\D/g, '')}`)}
                                style={{ backgroundColor: activeStyle?.bg || '#eff6ff', borderRadius: 12, padding: 10 }}>
                                <Phone size={18} color={activeStyle?.color || '#1d4ed8'} />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={() => Linking.openURL(`tel:${contact.phone.replace(/\D/g, '')}`)}
                            style={{
                                backgroundColor: activeStyle?.bg || '#eff6ff',
                                borderRadius: 10, paddingVertical: 8, alignItems: 'center', marginTop: 10
                            }}>
                            <Text style={{ color: activeStyle?.color || '#1d4ed8', fontWeight: '700', fontSize: 14 }}>
                                📞 {contact.phone}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}
