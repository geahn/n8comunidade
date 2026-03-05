import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Home, LayoutGrid, Users, Newspaper, ShoppingBag, Plus } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

import DashboardScreen from '../screens/DashboardScreen';
import ClassifiedsScreen from '../screens/ClassifiedsScreen';
import ShopsScreen from '../screens/ShopsScreen';
import SocialScreen from '../screens/SocialScreen';
import NewsScreen from '../screens/NewsScreen';
import AdminPanelScreen from '../screens/AdminPanelScreen';
import SuperAdminPanelScreen from '../screens/SuperAdminPanelScreen';
import ShopkeeperPanelScreen from '../screens/ShopkeeperPanelScreen';
import PublishHubModal from '../components/PublishHubModal';
import NewsDetailScreen from '../screens/NewsDetailScreen';
import ShopDetailScreen from '../screens/ShopDetailScreen';
import ClassifiedDetailScreen from '../screens/ClassifiedDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CartScreen from '../screens/CartScreen';
import OrdersScreen from '../screens/OrdersScreen';
import DriverPanelScreen from '../screens/DriverPanelScreen';

import { Alert } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabBar() {
    const { user } = useAuth() as any;
    const navigation = useNavigation<any>();
    const [publishVisible, setPublishVisible] = useState(false);

    const panelScreen = () => {
        const role = user?.role;
        if (role === 'global_admin') {
            navigation.navigate('SuperAdmin');
            return;
        }
        if (role === 'neighborhood_admin') {
            navigation.navigate('AdminPanel');
            return;
        }
        if (role === 'shopkeeper' || role === 'store_owner') {
            navigation.navigate('ShopkeeperPanel');
            return;
        }
        if (role === 'driver') {
            navigation.navigate('DriverPanel');
            return;
        }
    };

    const hasPanel = ['global_admin', 'neighborhood_admin', 'shopkeeper', 'store_owner', 'driver'].includes(user?.role);

    return (
        <>
            <Tab.Navigator
                screenOptions={{
                    tabBarActiveTintColor: '#1d4ed8',
                    tabBarInactiveTintColor: '#94a3b8',
                    headerShown: false,
                    tabBarStyle: {
                        height: 78,
                        paddingBottom: 20,
                        paddingTop: 10,
                        borderTopLeftRadius: 28,
                        borderTopRightRadius: 28,
                        backgroundColor: '#ffffff',
                        position: 'absolute',
                        borderTopWidth: 0,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 12,
                        elevation: 12,
                    },
                    tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
                }}
            >
                <Tab.Screen name="Meu Bairro" component={DashboardScreen}
                    options={{ tabBarIcon: ({ color }) => <Home size={24} color={color} /> }} />
                <Tab.Screen name="Classificados" component={ClassifiedsScreen}
                    options={{ tabBarIcon: ({ color }) => <LayoutGrid size={24} color={color} /> }} />
                <Tab.Screen name="Publicar" component={() => null}
                    options={{
                        tabBarButton: () => (
                            <TouchableOpacity onPress={() => setPublishVisible(true)}
                                style={{ top: -16, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', width: 64, height: 64 }}>
                                <View style={{
                                    width: 64, height: 64, borderRadius: 32, backgroundColor: '#1d4ed8',
                                    alignItems: 'center', justifyContent: 'center',
                                    shadowColor: '#1d4ed8', shadowOpacity: 0.5, shadowRadius: 10, elevation: 8,
                                }}>
                                    <Plus size={30} color="white" />
                                </View>
                            </TouchableOpacity>
                        ),
                        tabBarLabel: () => null,
                    }} />
                <Tab.Screen name="Lojas" component={ShopsScreen}
                    options={{ tabBarIcon: ({ color }) => <ShoppingBag size={24} color={color} /> }} />
                <Tab.Screen name="Notícias" component={NewsScreen}
                    options={{ tabBarIcon: ({ color }) => <Newspaper size={24} color={color} /> }} />
            </Tab.Navigator>

            {/* Publish Modal */}
            <PublishHubModal visible={publishVisible} onClose={() => setPublishVisible(false)} navigation={navigation} />

            {/* Admin/Shopkeeper/Driver floating badge */}
            {hasPanel && (
                <TouchableOpacity onPress={panelScreen}
                    style={{
                        position: 'absolute', bottom: 90, right: 16,
                        backgroundColor: user?.role === 'global_admin' ? '#0f172a' : user?.role === 'neighborhood_admin' ? '#7c3aed' : user?.role === 'driver' ? '#f59e0b' : '#065f46',
                        borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10,
                        flexDirection: 'row', alignItems: 'center',
                        shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 10,
                    }}>
                    <Text style={{ fontSize: 14 }}>
                        {user?.role === 'global_admin' ? '⚙️' : user?.role === 'neighborhood_admin' ? '🛡️' : user?.role === 'driver' ? '🛵' : '🏪'}
                    </Text>
                    <Text style={{ color: 'white', fontWeight: '700', marginLeft: 6, fontSize: 13 }}>
                        {user?.role === 'global_admin' ? 'Painel Global' : user?.role === 'neighborhood_admin' ? 'Admin' : user?.role === 'driver' ? 'Entregas' : 'Minha Loja'}
                    </Text>
                </TouchableOpacity>
            )}
        </>
    );
}

export default function MainTabs() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Tabs" component={MainTabBar} />
            <Stack.Screen name="AdminPanel" component={AdminPanelScreen}
                options={{ headerShown: true, title: 'Painel Admin', headerStyle: { backgroundColor: '#7c3aed' }, headerTintColor: 'white', headerTitleStyle: { fontWeight: 'bold' } }} />
            <Stack.Screen name="SuperAdmin" component={SuperAdminPanelScreen}
                options={{ headerShown: true, title: 'Superadmin', headerStyle: { backgroundColor: '#0f172a' }, headerTintColor: 'white', headerTitleStyle: { fontWeight: 'bold' } }} />
            <Stack.Screen name="ShopkeeperPanel" component={ShopkeeperPanelScreen}
                options={{ headerShown: true, title: 'Minha Loja', headerStyle: { backgroundColor: '#065f46' }, headerTintColor: 'white', headerTitleStyle: { fontWeight: 'bold' } }} />
            <Stack.Screen name="DriverPanel" component={DriverPanelScreen}
                options={{ headerShown: false }} />
            <Stack.Screen name="Social" component={SocialScreen}
                options={{ headerShown: true, title: 'Social', headerStyle: { backgroundColor: '#1d4ed8' }, headerTintColor: 'white', headerTitleStyle: { fontWeight: 'bold' } }} />
            <Stack.Screen name="NewsDetail" component={NewsDetailScreen}
                options={{ headerShown: false }} />
            <Stack.Screen name="ShopDetail" component={ShopDetailScreen}
                options={{ headerShown: false }} />
            <Stack.Screen name="ClassifiedDetail" component={ClassifiedDetailScreen}
                options={{ headerShown: false }} />
            <Stack.Screen name="Cart" component={CartScreen}
                options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="Orders" component={OrdersScreen}
                options={{ headerShown: false }} />
            <Stack.Screen name="Profile" component={ProfileScreen}
                options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}
