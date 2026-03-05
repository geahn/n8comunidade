import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
    id: string; // unique cart item id
    productId: string;
    name: string;
    price: number;
    quantity: number;
    shopId: string;
    shopName: string;
    imageUrl?: string;
    selections: Record<string, string | string[]>;
    notes: string;
}

interface CartContextData {
    items: CartItem[];
    shopId: string | null;
    shopName: string | null;
    totalAmount: number;
    totalItems: number;
    addToCart: (item: Omit<CartItem, 'id'>) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [shopId, setShopId] = useState<string | null>(null);
    const [shopName, setShopName] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadCart = async () => {
            try {
                const savedCart = await AsyncStorage.getItem('@cart');
                if (savedCart) {
                    const parsed = JSON.parse(savedCart);
                    setItems(parsed.items || []);
                    setShopId(parsed.shopId || null);
                    setShopName(parsed.shopName || null);
                }
            } catch (e) {
                console.error('Error loading cart', e);
            } finally {
                setIsLoaded(true);
            }
        };
        loadCart();
    }, []);

    useEffect(() => {
        if (isLoaded) {
            AsyncStorage.setItem('@cart', JSON.stringify({ items, shopId, shopName })).catch(e => console.error('Error saving cart', e));
        }
    }, [items, shopId, shopName, isLoaded]);

    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    const clearCart = () => {
        setItems([]);
        setShopId(null);
        setShopName(null);
    };

    const addToCart = (newItem: Omit<CartItem, 'id'>) => {
        if (shopId && shopId !== newItem.shopId) {
            Alert.alert(
                'Esvaziar carrinho?',
                `Você tem itens da loja "${shopName}". Deseja esvaziar o carrinho para adicionar itens de "${newItem.shopName}"?`,
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Esvaziar e Adicionar',
                        style: 'destructive',
                        onPress: () => {
                            setItems([{ ...newItem, id: Math.random().toString(36).substring(7) }]);
                            setShopId(newItem.shopId);
                            setShopName(newItem.shopName);
                        }
                    }
                ]
            );
            return;
        }

        const id = Math.random().toString(36).substring(7);
        setItems(prev => [...prev, { ...newItem, id }]);
        
        if (!shopId) {
            setShopId(newItem.shopId);
            setShopName(newItem.shopName);
        }
    };

    const removeFromCart = (id: string) => {
        setItems(prev => {
            const next = prev.filter(item => item.id !== id);
            if (next.length === 0) {
                setShopId(null);
                setShopName(null);
            }
            return next;
        });
    };

    return (
        <CartContext.Provider value={{
            items,
            shopId,
            shopName,
            totalAmount,
            totalItems,
            addToCart,
            removeFromCart,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
