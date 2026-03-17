export const API = '/api';

export interface ApiLocation {
    id: string;
    name: string;
    address: string;
    lat?: number;
    lng?: number;
    latitude?: number;
    longitude?: number;
    openTime?: string | null;
    closeTime?: string | null;
    isActive?: boolean;
    ordersToday?: number;
    revenueToday?: number;
    mapUrl?: string;
    active?: boolean;
    isPrimary?: boolean;
}

export interface ApiCategory {
    id: string;
    name: string;
    imageUrl?: string;
}

export interface ApiMenuItem {
    id: string;
    name: string;
    categoryId: string;
    category?: ApiCategory;
    price: number;
    isAvailable: boolean;
    dietary: string[];
    allergens: string[];
    imageUrl?: string;
}

export interface DashboardData {
    kpis: { revenue: number, orders: number, customers: number, avgOrder: number };
    modeSplit: { label: string, count: number, pct: number }[];
    recentOrders?: any[];
    topProducts?: any[];
    leastProducts: any[];
    peakHoursHeatmap: Record<string, number[]>;
    totalItemsSold?: number;
    customerList?: any[];
    categoryPerformance: { name: string, revenue: number, orders: number, pct: number }[];
    customerStats: {
        newCustomers: number;
        returningCustomers: number;
        peakHour: string;
        topLTV: number;
        newPct: number;
        retPct: number;
        active: number;
    };
    recentAnalytics?: any[];
}

export async function getLocations(): Promise<ApiLocation[]> { return []; }
export async function createLocation(data: any): Promise<any> { return {}; }
export async function updateLocation(id: string, data: any): Promise<any> { return {}; }
export async function toggleLocation(id: string): Promise<any> { return {}; }
export async function getCategories(): Promise<ApiCategory[]> { return []; }
export async function getMenuItems(): Promise<ApiMenuItem[]> { return []; }
export async function getOrders(branchId?: string): Promise<any[]> { return []; }
export async function updateOrderStatus(id: string, status: string): Promise<any> { return {}; }
export async function getUsers(): Promise<any[]> { return []; }
export async function updateUser(id: string, data: any): Promise<any> { return {}; }
export async function deleteUser(id: string): Promise<any> { return {}; }
export async function createCategory(data: any): Promise<any> { return {}; }
export async function updateCategory(id: string, data: any): Promise<any> { return {}; }
export async function deleteCategory(id: string): Promise<any> { return {}; }
export async function createMenuItem(data: any): Promise<any> { return {}; }
export async function updateMenuItem(id: string, data: any): Promise<any> { return {}; }
export async function deleteMenuItem(id: string): Promise<any> { return {}; }
export async function uploadImage(file: File): Promise<{url: string}> { return { url: '' }; }
export async function getAnalyticsDashboard(branchId?: string): Promise<DashboardData> { 
    return { 
        kpis: { revenue: 0, orders: 0, customers: 0, avgOrder: 0 }, 
        modeSplit: [], 
        recentOrders: [], 
        topProducts: [], 
        leastProducts: [],
        peakHoursHeatmap: {},
        totalItemsSold: 0,
        customerList: [],
        categoryPerformance: [],
        customerStats: {
            newCustomers: 0,
            returningCustomers: 0,
            peakHour: '12:00 PM',
            topLTV: 0,
            newPct: 0,
            retPct: 0,
            active: 0
        },
        recentAnalytics: []
    };
}
