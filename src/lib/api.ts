const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://waqty.alemtayaz.shop/public';

interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('hagzy_token');
    }

    async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
        const token = this.getToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'Accept-Language': typeof window !== 'undefined' ? localStorage.getItem('hagzy_language') || 'en' : 'en',
            ...(options.headers as Record<string, string>),
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
        });

        const data: ApiResponse<T> = await response.json();

        if (!response.ok) {
            throw { status: response.status, ...data };
        }

        return data;
    }

    async post<T>(endpoint: string, body: Record<string, unknown>): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    async get<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    async put<T>(endpoint: string, body: Record<string, unknown>): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    async patch<T>(endpoint: string, body?: Record<string, unknown>): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    async postFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
        const token = this.getToken();
        const headers: Record<string, string> = {
            Accept: 'application/json',
            'Accept-Language': typeof window !== 'undefined' ? localStorage.getItem('hagzy_language') || 'en' : 'en',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData,
        });
        const data: ApiResponse<T> = await response.json();
        if (!response.ok) throw { status: response.status, ...data };
        return data;
    }
}

export const api = new ApiClient(API_BASE_URL);
export type { ApiResponse };

// ── Response Types ──────────────────────────────────────

export interface ProviderLoginResponse {
    token: string;
    token_type: string;
    expires_in: number;
    provider: {
        uuid: string;
        name: string;
        email: string;
        phone: string;
        code: string | null;
        active: boolean;
        blocked: boolean;
        banned: boolean;
        created_at: string;
        updated_at: string;
    };
}

export interface ProviderProfile {
    uuid: string;
    name: string;
    email: string;
    phone: string;
    code: string | null;
    active: boolean;
    blocked: boolean;
    banned: boolean;
    category?: { uuid: string; name: string };
    branches?: Array<{ uuid: string; name: string; phone: string }>;
    created_at: string;
    updated_at: string;
}

export interface VerifyOtpResponse {
    valid: boolean;
}

export interface Category {
    uuid: string;
    name: string;
    image_url: string | null;
    subcategories_count: number;
    subcategories?: Subcategory[];
}

export interface Subcategory {
    uuid: string;
    name: string;
    category_uuid: string;
}

export interface Country {
    uuid: string;
    name: string;
    code: string;
    cities: City[];
}

export interface City {
    uuid: string;
    name: string;
    country_uuid: string;
}

// ── Provider Resource Types ─────────────────────────────

export interface Branch {
    uuid: string;
    name: string;
    phone: string;
    city_uuid: string;
    city?: { uuid: string; name: string };
    latitude: number | null;
    longitude: number | null;
    geofence_radius?: number | null;
    require_gps?: boolean;
    active: boolean;
    is_main: boolean;
    created_at: string;
    updated_at: string;
}

export interface Employee {
    uuid: string;
    name: string;
    email: string;
    phone: string;
    branch_uuid: string;
    branch?: { uuid: string; name: string };
    active: boolean;
    blocked: boolean;
    created_at: string;
    updated_at: string;
}

export interface Service {
    uuid: string;
    name: string;
    description: string | null;
    sub_category_uuid: string | null;
    sub_category?: { uuid: string; name: string };
    estimated_duration_minutes: number | null;
    image_url: string | null;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ShiftTemplate {
    uuid: string;
    name: string;
    start_time: string;
    end_time: string;
    break_start: string | null;
    break_end: string | null;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Shift {
    uuid: string;
    title: string | null;
    start_time: string;
    end_time: string;
    break_start: string | null;
    break_end: string | null;
    active: boolean;
    dates?: ShiftDate[];
    employees?: Employee[];
    created_at: string;
    updated_at: string;
}

export interface ShiftDate {
    uuid: string;
    date: string;
    shift_uuid: string;
}

export interface ServicePrice {
    uuid: string;
    service_uuid: string;
    service?: Service;
    branch_uuid: string | null;
    branch?: Branch;
    employee_uuid: string | null;
    employee?: Employee;
    pricing_group_uuid: string | null;
    pricing_group?: PricingGroup;
    price: number;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface PricingGroup {
    uuid: string;
    name: string;
    active: boolean;
    employees?: Employee[];
    created_at: string;
    updated_at: string;
}

export interface Booking {
    uuid: string;
    branch_uuid: string;
    branch?: Branch;
    service_uuid: string;
    service?: Service;
    employee_uuid: string | null;
    employee?: Employee;
    user?: { uuid: string; name: string; email: string; phone: string };
    booking_date: string;
    start_time: string;
    end_time: string | null;
    status: string; // pending | confirmed | completed | cancelled | no_show
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface BookingFilters {
    status?: string;
    branch_uuid?: string;
    employee_uuid?: string;
    booking_date?: string;
    from_date?: string;
    to_date?: string;
    per_page?: number;
}

export interface AttendanceRecord {
    uuid: string;
    employee_uuid: string;
    employee?: Employee;
    shift_date_uuid: string | null;
    check_in: string;
    check_out: string | null;
    working_minutes: number | null;
    notes: string | null;
    created_at: string;
}

export interface AttendanceFilters {
    employee_uuid?: string;
    date_from?: string;
    date_to?: string;
    shift_date_uuid?: string;
    per_page?: number;
}

export interface AvailableDatesFilters {
    branch_uuid: string;
    service_uuid: string;
    employee_uuid: string;
    month: string; // YYYY-MM
}

export interface AvailableSlotsFilters {
    branch_uuid: string;
    service_uuid: string;
    employee_uuid: string;
    date: string; // YYYY-MM-DD
}

export interface ServiceFilters {
    provider_uuid?: string;
    sub_category_uuid?: string;
    search?: string;
    per_page?: number;
}

export interface NearestServiceFilters extends ServiceFilters {
    lat: number;
    lng: number;
    radius?: number;
}

export interface EmployeeFilters {
    provider_uuid?: string;
    search?: string;
    per_page?: number;
}

export interface ResolvedPrice {
    price: number;
    currency?: string;
}

export interface EmployeeLoginResponse {
    token: string;
    token_type: string;
    expires_in: number;
    employee: Employee;
}

export interface EmployeeProfile {
    uuid: string;
    name: string;
    email: string;
    phone: string;
    active: boolean;
    blocked: boolean;
    branch?: { uuid: string; name: string };
    created_at: string;
    updated_at: string;
}

// ── Phone Helper ────────────────────────────────────────

export function toInternationalPhone(phone: string): string {
    const cleaned = phone.replace(/[\s\-()]/g, '');
    if (cleaned.startsWith('+20')) return cleaned;
    if (cleaned.startsWith('20')) return `+${cleaned}`;
    if (cleaned.startsWith('0')) return `+2${cleaned}`;
    return `+20${cleaned}`;
}

// ── Auth API ────────────────────────────────────────────

export const authApi = {
    login: (email: string, password: string) =>
        api.post<ProviderLoginResponse>('/api/provider/auth/login', { email, password }),

    me: () => api.get<ProviderProfile>('/api/provider/auth/me'),

    logout: () => api.post('/api/provider/auth/logout', {}),

    sendOtp: (email: string) => api.post('/api/provider/auth/send-otp', { email }),

    verifyOtp: (email: string, otp: string) =>
        api.post<VerifyOtpResponse>('/api/provider/auth/verify-otp', { email, otp }),

    resetPassword: (email: string, otp: string, newPassword: string) =>
        api.post('/api/provider/auth/reset-password', {
            email,
            otp,
            new_password: newPassword,
            new_password_confirmation: newPassword,
        }),

    register: (data: Record<string, unknown>) => api.post<ProviderLoginResponse>('/api/provider/auth/register', data),

    verifyEmail: (email: string, otp: string) => api.post('/api/provider/auth/verify-email', { email, otp }),

    resendVerificationOtp: (email: string) => api.post('/api/provider/auth/resend-verification-otp', { email }),
};

// ── Provider API ────────────────────────────────────────

export const providerApi = {
    // Profile
    updateProfile: (formData: FormData) => api.postFormData<ProviderProfile>('/api/provider/profile', formData),

    // Branches
    getBranches: () => api.get<Branch[]>('/api/provider/branches'),
    getBranch: (uuid: string) => api.get<Branch>(`/api/provider/branches/${uuid}`),
    createBranch: (data: Record<string, unknown>) => api.post<Branch>('/api/provider/branches', data),
    updateBranch: (uuid: string, data: Record<string, unknown>) =>
        api.put<Branch>(`/api/provider/branches/${uuid}`, data),
    deleteBranch: (uuid: string) => api.delete(`/api/provider/branches/${uuid}`),
    setMainBranch: (uuid: string) => api.patch(`/api/provider/branches/${uuid}/main`),

    // Employees
    getEmployees: () => api.get<Employee[]>('/api/provider/employees'),
    getEmployee: (uuid: string) => api.get<Employee>(`/api/provider/employees/${uuid}`),
    createEmployee: (data: Record<string, unknown>) => api.post<Employee>('/api/provider/employees', data),
    updateEmployee: (uuid: string, data: Record<string, unknown>) =>
        api.put<Employee>(`/api/provider/employees/${uuid}`, data),
    deleteEmployee: (uuid: string) => api.delete(`/api/provider/employees/${uuid}`),
    toggleEmployeeActive: (uuid: string, active: boolean) =>
        api.patch(`/api/provider/employees/${uuid}/active`, { active }),
    toggleEmployeeBlock: (uuid: string, blocked: boolean) =>
        api.patch(`/api/provider/employees/${uuid}/block`, { blocked }),

    // Services
    getServices: () => api.get<Service[]>('/api/provider/services'),
    getService: (uuid: string) => api.get<Service>(`/api/provider/services/${uuid}`),
    createService: (formData: FormData) => api.postFormData<Service>('/api/provider/services', formData),
    updateService: (uuid: string, formData: FormData) =>
        api.postFormData<Service>(`/api/provider/services/${uuid}`, formData),
    deleteService: (uuid: string) => api.delete(`/api/provider/services/${uuid}`),
    toggleServiceActive: (uuid: string, active: boolean) =>
        api.patch(`/api/provider/services/${uuid}/active`, { active }),

    // Shift Templates
    getShiftTemplates: () => api.get<ShiftTemplate[]>('/api/provider/shift-templates'),
    getShiftTemplate: (uuid: string) => api.get<ShiftTemplate>(`/api/provider/shift-templates/${uuid}`),
    createShiftTemplate: (data: Record<string, unknown>) =>
        api.post<ShiftTemplate>('/api/provider/shift-templates', data),
    updateShiftTemplate: (uuid: string, data: Record<string, unknown>) =>
        api.put<ShiftTemplate>(`/api/provider/shift-templates/${uuid}`, data),
    deleteShiftTemplate: (uuid: string) => api.delete(`/api/provider/shift-templates/${uuid}`),
    toggleShiftTemplateActive: (uuid: string, active: boolean) =>
        api.patch(`/api/provider/shift-templates/${uuid}/active`, { active }),

    // Shifts
    getShifts: () => api.get<Shift[]>('/api/provider/shifts'),
    getShift: (uuid: string) => api.get<Shift>(`/api/provider/shifts/${uuid}`),
    createShift: (data: Record<string, unknown>) => api.post<Shift>('/api/provider/shifts', data),
    updateShift: (uuid: string, data: Record<string, unknown>) => api.put<Shift>(`/api/provider/shifts/${uuid}`, data),
    deleteShift: (uuid: string) => api.delete(`/api/provider/shifts/${uuid}`),

    // Service Prices
    getServicePrices: () => api.get<ServicePrice[]>('/api/provider/service-prices'),
    getServicePrice: (uuid: string) => api.get<ServicePrice>(`/api/provider/service-prices/${uuid}`),
    createServicePrice: (data: Record<string, unknown>) => api.post<ServicePrice>('/api/provider/service-prices', data),
    updateServicePrice: (uuid: string, data: Record<string, unknown>) =>
        api.put<ServicePrice>(`/api/provider/service-prices/${uuid}`, data),
    deleteServicePrice: (uuid: string) => api.delete(`/api/provider/service-prices/${uuid}`),
    toggleServicePriceActive: (uuid: string) => api.patch(`/api/provider/service-prices/${uuid}/active`),

    // Pricing Groups
    getPricingGroups: () => api.get<PricingGroup[]>('/api/provider/pricing-groups'),
    getPricingGroup: (uuid: string) => api.get<PricingGroup>(`/api/provider/pricing-groups/${uuid}`),
    createPricingGroup: (data: Record<string, unknown>) => api.post<PricingGroup>('/api/provider/pricing-groups', data),
    updatePricingGroup: (uuid: string, data: Record<string, unknown>) =>
        api.put<PricingGroup>(`/api/provider/pricing-groups/${uuid}`, data),
    deletePricingGroup: (uuid: string) => api.delete(`/api/provider/pricing-groups/${uuid}`),
    togglePricingGroupActive: (uuid: string) => api.patch(`/api/provider/pricing-groups/${uuid}/active`),
    syncPricingGroupEmployees: (uuid: string, employeeUuids: string[]) =>
        api.put(`/api/provider/pricing-groups/${uuid}/employees`, { employee_uuids: employeeUuids }),
    addPricingGroupEmployees: (uuid: string, employeeUuids: string[]) =>
        api.post(`/api/provider/pricing-groups/${uuid}/employees`, { employee_uuids: employeeUuids }),
    removePricingGroupEmployees: (uuid: string, _employeeUuids: string[]) =>
        api.delete(`/api/provider/pricing-groups/${uuid}/employees`),

    // Bookings
    getBookings: (filters?: BookingFilters) => {
        const params = new URLSearchParams();
        if (filters) {
            for (const [key, val] of Object.entries(filters)) {
                if (val !== undefined && val !== null && val !== '') params.set(key, String(val));
            }
        }
        const qs = params.toString();
        return api.get<Booking[]>(`/api/provider/bookings${qs ? `?${qs}` : ''}`);
    },
    getBooking: (uuid: string) => api.get<Booking>(`/api/provider/bookings/${uuid}`),
    updateBookingStatus: (uuid: string, status: string) =>
        api.patch(`/api/provider/bookings/${uuid}/status`, { status }),

    // Attendance
    getAttendance: (filters?: AttendanceFilters) => {
        const params = new URLSearchParams();
        if (filters) {
            for (const [key, val] of Object.entries(filters)) {
                if (val !== undefined && val !== null && val !== '') params.set(key, String(val));
            }
        }
        const qs = params.toString();
        return api.get<AttendanceRecord[]>(`/api/provider/attendance${qs ? `?${qs}` : ''}`);
    },
};

// ── Public API ──────────────────────────────────────────

export const publicApi = {
    // Categories
    getCategories: () => api.get<Category[]>('/api/public/categories'),
    getCategory: (uuid: string) => api.get<Category>(`/api/public/categories/${uuid}`),

    // Subcategories
    getSubcategories: (categoryUuid: string) =>
        api.get<Subcategory[]>(`/api/public/categories/${categoryUuid}/subcategories`),
    getAllSubcategories: () => api.get<Subcategory[]>('/api/public/subcategories'),

    // Countries & Cities
    getCountries: () => api.get<Country[]>('/api/public/countries'),
    getCountry: (uuid: string) => api.get<Country>(`/api/public/countries/${uuid}`),
    getCities: () => api.get<City[]>('/api/public/cities'),

    // Providers
    getProviders: () => api.get<ProviderProfile[]>('/api/public/providers'),
    getProvider: (uuid: string) => api.get<ProviderProfile>(`/api/public/providers/${uuid}`),

    // Provider Branches
    getProviderBranches: () => api.get<Branch[]>('/api/public/provider-branches'),
    getProviderBranch: (uuid: string) => api.get<Branch>(`/api/public/provider-branches/${uuid}`),

    // Employees
    getEmployees: (filters?: EmployeeFilters) => {
        const params = new URLSearchParams();
        if (filters) {
            for (const [key, val] of Object.entries(filters)) {
                if (val !== undefined && val !== null && val !== '') params.set(key, String(val));
            }
        }
        const qs = params.toString();
        return api.get<Employee[]>(`/api/public/employees${qs ? `?${qs}` : ''}`);
    },

    // Services
    getServicesAll: (filters?: ServiceFilters) => {
        const params = new URLSearchParams();
        if (filters) {
            for (const [key, val] of Object.entries(filters)) {
                if (val !== undefined && val !== null && val !== '') params.set(key, String(val));
            }
        }
        const qs = params.toString();
        return api.get<Service[]>(`/api/public/services/all${qs ? `?${qs}` : ''}`);
    },
    getServices: (filters?: ServiceFilters) => {
        const params = new URLSearchParams();
        if (filters) {
            for (const [key, val] of Object.entries(filters)) {
                if (val !== undefined && val !== null && val !== '') params.set(key, String(val));
            }
        }
        const qs = params.toString();
        return api.get<Service[]>(`/api/public/services${qs ? `?${qs}` : ''}`);
    },
    getNewestServices: (filters?: ServiceFilters) => {
        const params = new URLSearchParams();
        if (filters) {
            for (const [key, val] of Object.entries(filters)) {
                if (val !== undefined && val !== null && val !== '') params.set(key, String(val));
            }
        }
        const qs = params.toString();
        return api.get<Service[]>(`/api/public/services/newest${qs ? `?${qs}` : ''}`);
    },
    getNearestServices: (filters: NearestServiceFilters) => {
        const params = new URLSearchParams();
        for (const [key, val] of Object.entries(filters)) {
            if (val !== undefined && val !== null && val !== '') params.set(key, String(val));
        }
        return api.get<Service[]>(`/api/public/services/nearest?${params.toString()}`);
    },
    getService: (uuid: string, providerUuid?: string, branchUuid?: string) => {
        const params = new URLSearchParams();
        if (providerUuid) params.set('provider_uuid', providerUuid);
        if (branchUuid) params.set('branch_uuid', branchUuid);
        const qs = params.toString();
        return api.get<Service>(`/api/public/services/${uuid}${qs ? `?${qs}` : ''}`);
    },

    // Service Pricing
    resolveServicePrice: (serviceUuid: string, branchUuid?: string, employeeUuid?: string) => {
        const params = new URLSearchParams();
        if (branchUuid) params.set('branch_uuid', branchUuid);
        if (employeeUuid) params.set('employee_uuid', employeeUuid);
        const qs = params.toString();
        return api.get<ResolvedPrice>(`/api/public/service-pricing/services/${serviceUuid}/price${qs ? `?${qs}` : ''}`);
    },

    // Booking Availability
    getAvailableDates: (filters: AvailableDatesFilters) => {
        const params = new URLSearchParams();
        for (const [key, val] of Object.entries(filters)) {
            if (val !== undefined && val !== null && val !== '') params.set(key, String(val));
        }
        return api.get<string[]>(`/api/public/bookings/available-dates?${params.toString()}`);
    },
    getAvailableSlots: (filters: AvailableSlotsFilters) => {
        const params = new URLSearchParams();
        for (const [key, val] of Object.entries(filters)) {
            if (val !== undefined && val !== null && val !== '') params.set(key, String(val));
        }
        return api.get<string[]>(`/api/public/bookings/available-slots?${params.toString()}`);
    },
};

// ── Employee API ───────────────────────────────────────

export const employeeApi = {
    // Auth
    login: (email: string, password: string) =>
        api.post<EmployeeLoginResponse>('/api/employee/auth/login', { email, password }),
    me: () => api.get<EmployeeProfile>('/api/employee/auth/me'),
    logout: () => api.post('/api/employee/auth/logout', {}),
    sendOtp: (email: string) => api.post('/api/employee/auth/send-otp', { email }),
    verifyOtp: (email: string, otp: string) =>
        api.post<VerifyOtpResponse>('/api/employee/auth/verify-otp', { email, otp }),
    forgotPassword: (email: string) => api.post('/api/employee/auth/forgot-password', { email }),
    resetPassword: (email: string, otp: string, newPassword: string) =>
        api.post('/api/employee/auth/reset-password', {
            email,
            otp,
            new_password: newPassword,
            new_password_confirmation: newPassword,
        }),
    verifyEmail: (email: string, otp: string) => api.post('/api/employee/auth/verify-email', { email, otp }),
    resendVerificationOtp: (email: string) => api.post('/api/employee/auth/resend-verification-otp', { email }),

    // Profile
    updateProfile: (data: Record<string, unknown>) => api.put<EmployeeProfile>('/api/employee/profile', data),
    changePassword: (data: Record<string, unknown>) => api.put('/api/employee/change-password', data),

    // Services
    getServicesAll: (filters?: ServiceFilters) => {
        const params = new URLSearchParams();
        if (filters) {
            for (const [key, val] of Object.entries(filters)) {
                if (val !== undefined && val !== null && val !== '') params.set(key, String(val));
            }
        }
        const qs = params.toString();
        return api.get<Service[]>(`/api/employee/services/all${qs ? `?${qs}` : ''}`);
    },
    getServices: (filters?: ServiceFilters) => {
        const params = new URLSearchParams();
        if (filters) {
            for (const [key, val] of Object.entries(filters)) {
                if (val !== undefined && val !== null && val !== '') params.set(key, String(val));
            }
        }
        const qs = params.toString();
        return api.get<Service[]>(`/api/employee/services${qs ? `?${qs}` : ''}`);
    },
    getServicesWithPrices: (filters?: ServiceFilters) => {
        const params = new URLSearchParams();
        if (filters) {
            for (const [key, val] of Object.entries(filters)) {
                if (val !== undefined && val !== null && val !== '') params.set(key, String(val));
            }
        }
        const qs = params.toString();
        return api.get<Service[]>(`/api/employee/services/with-prices${qs ? `?${qs}` : ''}`);
    },
    getService: (uuid: string) => api.get<Service>(`/api/employee/services/${uuid}`),

    // Service Pricing
    resolveServicePrice: (serviceUuid: string) =>
        api.get<ResolvedPrice>(`/api/employee/service-pricing/services/${serviceUuid}/price`),

    // Shifts
    getShifts: () => api.get<ShiftDate[]>('/api/employee/shifts'),
    getShift: (uuid: string) => api.get<ShiftDate>(`/api/employee/shifts/${uuid}`),

    // Attendance
    checkIn: (data: { shift_date_uuid?: string; notes?: string }) =>
        api.post<AttendanceRecord>('/api/employee/attendance/check-in', data as Record<string, unknown>),
    checkOut: (data: { notes?: string }) =>
        api.post<AttendanceRecord>('/api/employee/attendance/check-out', data as Record<string, unknown>),
    getAttendance: (filters?: AttendanceFilters) => {
        const params = new URLSearchParams();
        if (filters) {
            for (const [key, val] of Object.entries(filters)) {
                if (val !== undefined && val !== null && val !== '') params.set(key, String(val));
            }
        }
        const qs = params.toString();
        return api.get<AttendanceRecord[]>(`/api/employee/attendance${qs ? `?${qs}` : ''}`);
    },

    // Bookings
    getBookings: (filters?: BookingFilters & { today?: boolean; upcoming?: boolean }) => {
        const params = new URLSearchParams();
        if (filters) {
            for (const [key, val] of Object.entries(filters)) {
                if (val !== undefined && val !== null && val !== '') {
                    params.set(key, val === true ? '1' : String(val));
                }
            }
        }
        const qs = params.toString();
        return api.get<Booking[]>(`/api/employee/bookings${qs ? `?${qs}` : ''}`);
    },
    getBooking: (uuid: string) => api.get<Booking>(`/api/employee/bookings/${uuid}`),
    updateBookingStatus: (uuid: string, status: string) =>
        api.patch(`/api/employee/bookings/${uuid}/status`, { status }),
};

// ── New Resource Types (Gap Remediation) ──────────────

export interface PaginationParams {
    page?: number;
    per_page?: number;
    search?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

// Customers
export interface Customer {
    uuid: string;
    name: string;
    email: string | null;
    phone: string;
    group_uuid: string | null;
    group?: CustomerGroup;
    vip: boolean;
    notes: string | null;
    allergies: string | null;
    medical_conditions: string | null;
    medications: string | null;
    total_visits: number;
    total_spent: number;
    last_visit: string | null;
    created_at: string;
    updated_at: string;
}

export interface CustomerGroup {
    uuid: string;
    name: string;
    discount_percentage: number;
    color: string;
    description: string | null;
    customers_count: number;
    created_at: string;
    updated_at: string;
}

export interface CustomerStatement {
    uuid: string;
    customer_uuid: string;
    type: 'credit' | 'debit';
    amount: number;
    balance: number;
    description: string;
    reference_type: string | null;
    reference_uuid: string | null;
    created_at: string;
}

export interface CustomerReview {
    uuid: string;
    customer_uuid: string;
    customer?: Customer;
    employee_uuid: string | null;
    employee?: Employee;
    service_uuid: string | null;
    service?: Service;
    booking_uuid: string | null;
    rating: number;
    comment: string | null;
    response: string | null;
    status: 'pending' | 'published' | 'flagged' | 'hidden' | 'reported';
    direction: 'by_customer' | 'about_customer';
    created_at: string;
    updated_at: string;
}

export interface StaffNote {
    uuid: string;
    customer_uuid: string;
    employee_uuid: string;
    employee?: Employee;
    note: string;
    service_uuid: string | null;
    service?: Service;
    created_at: string;
    updated_at: string;
}

// Transactions
export interface Transaction {
    uuid: string;
    type: 'sale' | 'refund' | 'advance_payment' | 'petty_cash' | 'transfer';
    amount: number;
    payment_method: string;
    status: 'completed' | 'pending' | 'cancelled' | 'partial';
    customer_uuid: string | null;
    customer?: Customer;
    employee_uuid: string | null;
    employee?: Employee;
    branch_uuid: string;
    branch?: Branch;
    booking_uuid: string | null;
    notes: string | null;
    reference_number: string | null;
    created_at: string;
    updated_at: string;
}

export interface TransactionFilters extends PaginationParams {
    type?: string;
    status?: string;
    payment_method?: string;
    branch_uuid?: string;
    employee_uuid?: string;
    customer_uuid?: string;
    from_date?: string;
    to_date?: string;
}

export interface CashSale {
    uuid: string;
    transaction_uuid: string;
    service_uuid: string;
    service?: Service;
    customer_uuid: string | null;
    customer?: Customer;
    employee_uuid: string;
    employee?: Employee;
    amount: number;
    tier: string | null;
    created_at: string;
}

export interface AdvancePayment {
    uuid: string;
    customer_uuid: string;
    customer?: Customer;
    booking_uuid: string | null;
    amount: number;
    paid_amount: number;
    status: 'paid' | 'partial' | 'pending';
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface PettyCash {
    uuid: string;
    category: string;
    description: string;
    amount: number;
    approved_by: string | null;
    branch_uuid: string;
    branch?: Branch;
    status: 'approved' | 'pending' | 'rejected';
    created_at: string;
}

export interface SafeBalance {
    uuid: string;
    name: string;
    branch_uuid: string;
    branch?: Branch;
    balance: number;
    last_updated: string;
}

export interface ShiftTotal {
    uuid: string;
    employee_uuid: string;
    employee?: Employee;
    branch_uuid: string;
    shift_date: string;
    opening_balance: number;
    closing_balance: number;
    total_sales: number;
    variance: number;
    status: 'open' | 'closed' | 'reconciled';
}

export interface MoneyTransfer {
    uuid: string;
    from_safe_uuid: string;
    to_safe_uuid: string;
    amount: number;
    notes: string | null;
    transferred_by: string;
    created_at: string;
}

// Reports
export interface DashboardSummary {
    total_revenue: number;
    total_bookings: number;
    new_clients: number;
    total_invoices: number;
    total_returns: number;
    revenue_trend: number;
    bookings_trend: number;
    clients_trend: number;
    top_services: Array<{ name: string; revenue: number; count: number }>;
    top_employees: Array<{ name: string; revenue: number; bookings: number }>;
    top_clients: Array<{ name: string; visits: number; spent: number }>;
    booking_status_distribution: Array<{ status: string; count: number }>;
    revenue_by_day: Array<{ date: string; revenue: number }>;
    occupancy_rate: number;
}

export interface ReportFilters {
    from_date?: string;
    to_date?: string;
    branch_uuid?: string;
    employee_uuid?: string;
    service_uuid?: string;
    group_by?: 'day' | 'week' | 'month';
}

export interface ReportData {
    labels: string[];
    datasets: Array<{ label: string; data: number[] }>;
    summary: Record<string, number>;
}

// Marketing
export interface Offer {
    uuid: string;
    name: string;
    type: 'percentage' | 'fixed' | 'bundle' | 'free_service';
    value: number;
    min_purchase: number | null;
    service_uuids: string[];
    services?: Service[];
    start_date: string;
    end_date: string;
    usage_limit: number | null;
    usage_count: number;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface PromoCode {
    uuid: string;
    code: string;
    offer_uuid: string | null;
    offer?: Offer;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    usage_limit: number | null;
    usage_count: number;
    per_client_limit: number | null;
    start_date: string;
    end_date: string;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface MarketingMessage {
    uuid: string;
    type: 'sms' | 'email' | 'push';
    subject: string | null;
    body: string;
    template_uuid: string | null;
    recipient_type: 'all' | 'group' | 'individual';
    recipient_group_uuid: string | null;
    recipient_uuids: string[];
    sent_count: number;
    delivered_count: number;
    status: 'draft' | 'scheduled' | 'sent' | 'failed';
    scheduled_at: string | null;
    sent_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface MessageTemplate {
    uuid: string;
    name: string;
    type: 'sms' | 'email' | 'push';
    subject: string | null;
    body: string;
    placeholders: string[];
    created_at: string;
    updated_at: string;
}

export interface Announcement {
    uuid: string;
    title: string;
    body: string;
    target: 'all' | 'branch' | 'role';
    target_branch_uuid: string | null;
    target_role: string | null;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    status: 'draft' | 'published' | 'scheduled';
    scheduled_at: string | null;
    published_at: string | null;
    read_count: number;
    created_at: string;
    updated_at: string;
}

export interface MarketingPackage {
    uuid: string;
    name: string;
    description: string | null;
    service_uuids: string[];
    services?: Service[];
    price: number;
    original_price: number;
    validity_days: number;
    active: boolean;
    sold_count: number;
    created_at: string;
    updated_at: string;
}

// Sales & Returns
export interface Sale {
    uuid: string;
    items: SaleItem[];
    customer_uuid: string | null;
    customer?: Customer;
    employee_uuid: string;
    employee?: Employee;
    branch_uuid: string;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    payment_method: string;
    status: 'completed' | 'pending' | 'cancelled';
    created_at: string;
}

export interface SaleItem {
    uuid: string;
    sale_uuid: string;
    service_uuid: string;
    service?: Service;
    quantity: number;
    unit_price: number;
    discount: number;
    total: number;
}

export interface Return {
    uuid: string;
    type: 'cash_refund' | 'cancel_down_payment' | 'petty_cash_refund';
    transaction_uuid: string | null;
    customer_uuid: string | null;
    customer?: Customer;
    amount: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    approved_by: string | null;
    created_at: string;
    updated_at: string;
}

// Expenses
export interface Expense {
    uuid: string;
    category: string;
    vendor: string | null;
    description: string;
    amount: number;
    branch_uuid: string;
    branch?: Branch;
    status: 'pending' | 'approved' | 'rejected';
    approved_by: string | null;
    receipt_url: string | null;
    date: string;
    created_at: string;
    updated_at: string;
}

// Payroll
export interface PayrollRecord {
    uuid: string;
    employee_uuid: string;
    employee?: Employee;
    period_start: string;
    period_end: string;
    base_salary: number;
    commission: number;
    bonus: number;
    deductions: number;
    tips: number;
    net_salary: number;
    status: 'draft' | 'approved' | 'paid';
    paid_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface Commission {
    uuid: string;
    employee_uuid: string;
    employee?: Employee;
    service_uuid: string;
    service?: Service;
    booking_uuid: string | null;
    amount: number;
    rate: number;
    type: 'percentage' | 'fixed';
    period: string;
    created_at: string;
}

export interface CommissionRule {
    uuid: string;
    name: string;
    service_uuid: string | null;
    service?: Service;
    type: 'percentage' | 'fixed';
    value: number;
    min_target: number | null;
    tier_multiplier: number;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Deduction {
    uuid: string;
    employee_uuid: string;
    employee?: Employee;
    category: string;
    description: string;
    amount: number;
    date: string;
    attachment_url: string | null;
    created_at: string;
}

// Employee sub-modules
export interface EmployeePerformance {
    uuid: string;
    employee_uuid: string;
    employee?: Employee;
    period: string;
    total_revenue: number;
    total_bookings: number;
    average_rating: number;
    client_retention_rate: number;
    on_time_rate: number;
    upsell_rate: number;
    rank: number;
    created_at: string;
}

export interface EmployeeTarget {
    uuid: string;
    employee_uuid: string;
    employee?: Employee;
    type: 'revenue' | 'bookings';
    target_value: number;
    current_value: number;
    period_start: string;
    period_end: string;
    tier_multiplier: number;
    created_at: string;
    updated_at: string;
}

export interface Role {
    uuid: string;
    name: string;
    description: string | null;
    permissions: Record<string, string[]>;
    employees_count: number;
    created_at: string;
    updated_at: string;
}

export interface Position {
    uuid: string;
    name: string;
    level: string;
    department_uuid: string | null;
    department?: Department;
    salary_min: number;
    salary_max: number;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Department {
    uuid: string;
    name: string;
    manager_uuid: string | null;
    manager?: Employee;
    staff_count: number;
    created_at: string;
    updated_at: string;
}

export interface EmployeeTransfer {
    uuid: string;
    employee_uuid: string;
    employee?: Employee;
    from_branch_uuid: string;
    from_branch?: Branch;
    to_branch_uuid: string;
    to_branch?: Branch;
    type: 'permanent' | 'temporary';
    reason: string | null;
    status: 'pending' | 'approved' | 'completed' | 'rejected';
    effective_date: string;
    created_at: string;
    updated_at: string;
}

export interface TimeTrackingEntry {
    uuid: string;
    employee_uuid: string;
    employee?: Employee;
    date: string;
    clock_in: string;
    clock_out: string | null;
    break_minutes: number;
    total_hours: number;
    overtime_hours: number;
    status: 'present' | 'late' | 'absent' | 'leave';
    notes: string | null;
}

export interface FingerprintRecord {
    uuid: string;
    employee_uuid: string;
    employee?: Employee;
    finger_index: number;
    enrolled: boolean;
    enrolled_at: string | null;
    device_uuid: string | null;
}

export interface AttendanceMethod {
    uuid: string;
    name: string;
    type: 'fingerprint' | 'face_recognition' | 'mobile_gps' | 'pin';
    enabled: boolean;
    config: Record<string, unknown>;
    created_at: string;
}

// Settings sub-modules
export interface BusinessHours {
    uuid: string;
    day: number;
    open_time: string;
    close_time: string;
    break_start: string | null;
    break_end: string | null;
    is_closed: boolean;
}

export interface PaymentMethod {
    uuid: string;
    name: string;
    type: 'cash' | 'card' | 'wallet' | 'bank_transfer';
    fee_percentage: number;
    fee_fixed: number;
    active: boolean;
    created_at: string;
}

export interface Safe {
    uuid: string;
    name: string;
    branch_uuid: string;
    branch?: Branch;
    balance: number;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Resource {
    uuid: string;
    name: string;
    type: 'room' | 'chair' | 'equipment' | 'other';
    branch_uuid: string;
    branch?: Branch;
    capacity: number;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface InvoiceSettings {
    business_name: string;
    business_address: string;
    tax_number: string | null;
    invoice_prefix: string;
    next_number: number;
    tax_rate: number;
    notes: string | null;
    logo_url: string | null;
}

export interface NotificationSetting {
    key: string;
    label: string;
    enabled: boolean;
    channels: ('email' | 'sms' | 'push')[];
}

export interface Integration {
    uuid: string;
    name: string;
    type: string;
    status: 'connected' | 'disconnected' | 'error';
    config: Record<string, unknown>;
    connected_at: string | null;
    created_at: string;
}

export interface SubscriptionPlan {
    uuid: string;
    name: string;
    price: number;
    billing_cycle: 'monthly' | 'yearly';
    features: string[];
    limits: Record<string, number>;
    current: boolean;
}

export interface AuditLogEntry {
    uuid: string;
    user_uuid: string;
    user_name: string;
    user_role: string;
    action: string;
    entity_type: string;
    entity_uuid: string | null;
    details: Record<string, unknown>;
    ip_address: string | null;
    created_at: string;
}

export interface DiaryAutomation {
    uuid: string;
    name: string;
    trigger: string;
    action: string;
    conditions: Record<string, unknown>;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ShiftAutomation {
    uuid: string;
    name: string;
    trigger: string;
    action: string;
    conditions: Record<string, unknown>;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface PettyCashItem {
    uuid: string;
    name: string;
    category: string;
    default_amount: number | null;
    active: boolean;
    created_at: string;
}

export interface ServiceCategory {
    uuid: string;
    name: string;
    sort_order: number;
    services_count: number;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ServiceEmployeeMapping {
    service_uuid: string;
    service?: Service;
    employee_uuid: string;
    employee?: Employee;
    active: boolean;
}

// Tipping
export interface TipConfig {
    enabled: boolean;
    percentages: number[];
    allow_custom: boolean;
    distribution_method: 'individual' | 'pool' | 'split';
}

export interface Tip {
    uuid: string;
    booking_uuid: string | null;
    customer_uuid: string | null;
    employee_uuid: string;
    employee?: Employee;
    amount: number;
    method: string;
    created_at: string;
}

// Waitlist
export interface WaitlistEntry {
    uuid: string;
    customer_uuid: string;
    customer?: Customer;
    service_uuid: string;
    service?: Service;
    branch_uuid: string;
    preferred_date: string;
    preferred_time: string | null;
    employee_uuid: string | null;
    status: 'waiting' | 'notified' | 'booked' | 'cancelled';
    position: number;
    created_at: string;
    updated_at: string;
}

// Loyalty
export interface LoyaltyConfig {
    enabled: boolean;
    points_per_egp: number;
    points_per_booking: number;
    referral_bonus: number;
    tiers: LoyaltyTier[];
    redemption_rate: number;
}

export interface LoyaltyTier {
    name: string;
    min_points: number;
    discount_percentage: number;
    color: string;
}

export interface LoyaltyTransaction {
    uuid: string;
    customer_uuid: string;
    type: 'earned' | 'redeemed' | 'expired' | 'bonus';
    points: number;
    balance: number;
    description: string;
    reference_uuid: string | null;
    created_at: string;
}

// Bug Report
export interface BugReport {
    uuid: string;
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    steps_to_reproduce: string;
    screenshot_url: string | null;
    page_url: string;
    browser_info: string;
    user_role: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    created_at: string;
}

// ── Helper for building query strings ─────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildQueryString(filters?: Record<string, any>): string {
    if (!filters) return '';
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(filters)) {
        if (val !== undefined && val !== null && val !== '') {
            params.set(key, val === true ? '1' : String(val));
        }
    }
    const qs = params.toString();
    return qs ? `?${qs}` : '';
}

// ── Extended Provider API (Gap Remediation) ───────────

export const dashboardApi = {
    getSummary: (filters?: ReportFilters) =>
        api.get<DashboardSummary>(`/api/provider/dashboard/summary${buildQueryString(filters)}`),
};

export const customerApi = {
    getCustomers: (filters?: PaginationParams & { group_uuid?: string; vip?: boolean }) =>
        api.get<Customer[]>(`/api/provider/customers${buildQueryString(filters)}`),
    getCustomer: (uuid: string) => api.get<Customer>(`/api/provider/customers/${uuid}`),
    createCustomer: (data: Record<string, unknown>) => api.post<Customer>('/api/provider/customers', data),
    updateCustomer: (uuid: string, data: Record<string, unknown>) =>
        api.put<Customer>(`/api/provider/customers/${uuid}`, data),
    deleteCustomer: (uuid: string) => api.delete(`/api/provider/customers/${uuid}`),

    // Groups
    getGroups: () => api.get<CustomerGroup[]>('/api/provider/customer-groups'),
    getGroup: (uuid: string) => api.get<CustomerGroup>(`/api/provider/customer-groups/${uuid}`),
    createGroup: (data: Record<string, unknown>) => api.post<CustomerGroup>('/api/provider/customer-groups', data),
    updateGroup: (uuid: string, data: Record<string, unknown>) =>
        api.put<CustomerGroup>(`/api/provider/customer-groups/${uuid}`, data),
    deleteGroup: (uuid: string) => api.delete(`/api/provider/customer-groups/${uuid}`),

    // Statements
    getStatements: (customerUuid: string, filters?: PaginationParams) =>
        api.get<CustomerStatement[]>(`/api/provider/customers/${customerUuid}/statements${buildQueryString(filters)}`),

    // Reviews
    getReviews: (filters?: PaginationParams & { status?: string; rating?: number; customer_uuid?: string }) =>
        api.get<CustomerReview[]>(`/api/provider/reviews${buildQueryString(filters)}`),
    getCustomerReviews: (customerUuid: string) =>
        api.get<CustomerReview[]>(`/api/provider/customers/${customerUuid}/reviews`),
    respondToReview: (uuid: string, response: string) =>
        api.patch<CustomerReview>(`/api/provider/reviews/${uuid}/respond`, { response }),
    flagReview: (uuid: string, reason: string) => api.patch(`/api/provider/reviews/${uuid}/flag`, { reason }),
    hideReview: (uuid: string) => api.patch(`/api/provider/reviews/${uuid}/hide`),

    // Staff Notes
    getStaffNotes: (customerUuid: string) =>
        api.get<StaffNote[]>(`/api/provider/customers/${customerUuid}/staff-notes`),
    createStaffNote: (customerUuid: string, data: Record<string, unknown>) =>
        api.post<StaffNote>(`/api/provider/customers/${customerUuid}/staff-notes`, data),
    deleteStaffNote: (customerUuid: string, noteUuid: string) =>
        api.delete(`/api/provider/customers/${customerUuid}/staff-notes/${noteUuid}`),

    // Last Visits
    getLastVisits: (filters?: PaginationParams & { days_since?: number }) =>
        api.get<Customer[]>(`/api/provider/customers/last-visits${buildQueryString(filters)}`),
};

export const transactionApi = {
    getTransactions: (filters?: TransactionFilters) =>
        api.get<Transaction[]>(`/api/provider/transactions${buildQueryString(filters)}`),
    getTransaction: (uuid: string) => api.get<Transaction>(`/api/provider/transactions/${uuid}`),
    createTransaction: (data: Record<string, unknown>) => api.post<Transaction>('/api/provider/transactions', data),

    // Cash Sales
    getCashSales: (filters?: TransactionFilters) =>
        api.get<CashSale[]>(`/api/provider/transactions/cash-sales${buildQueryString(filters)}`),

    // Advance Payments
    getAdvancePayments: (filters?: TransactionFilters) =>
        api.get<AdvancePayment[]>(`/api/provider/transactions/advance-payments${buildQueryString(filters)}`),
    createAdvancePayment: (data: Record<string, unknown>) =>
        api.post<AdvancePayment>('/api/provider/transactions/advance-payments', data),

    // Petty Cash
    getPettyCash: (filters?: TransactionFilters) =>
        api.get<PettyCash[]>(`/api/provider/transactions/petty-cash${buildQueryString(filters)}`),
    createPettyCash: (data: Record<string, unknown>) =>
        api.post<PettyCash>('/api/provider/transactions/petty-cash', data),

    // Safe Balances
    getSafeBalances: () => api.get<SafeBalance[]>('/api/provider/transactions/safe-balances'),

    // Shift Totals
    getShiftTotals: (filters?: TransactionFilters) =>
        api.get<ShiftTotal[]>(`/api/provider/transactions/shift-totals${buildQueryString(filters)}`),
    closeShift: (uuid: string, data: Record<string, unknown>) =>
        api.patch(`/api/provider/transactions/shift-totals/${uuid}/close`, data),

    // Transfers
    getTransfers: (filters?: TransactionFilters) =>
        api.get<MoneyTransfer[]>(`/api/provider/transactions/transfers${buildQueryString(filters)}`),
    createTransfer: (data: Record<string, unknown>) =>
        api.post<MoneyTransfer>('/api/provider/transactions/transfers', data),

    // Daily Reports
    getDailies: (filters?: TransactionFilters) =>
        api.get<Record<string, unknown>[]>(`/api/provider/transactions/dailies${buildQueryString(filters)}`),

    // Best Sales
    getBestSales: (filters?: TransactionFilters) =>
        api.get<Record<string, unknown>[]>(`/api/provider/transactions/best-sales${buildQueryString(filters)}`),

    // Client Sales
    getClientSales: (filters?: TransactionFilters) =>
        api.get<Record<string, unknown>[]>(`/api/provider/transactions/client-sales${buildQueryString(filters)}`),

    // Package Sales
    getPackageSales: (filters?: TransactionFilters) =>
        api.get<Record<string, unknown>[]>(`/api/provider/transactions/package-sales${buildQueryString(filters)}`),
};

export const reportApi = {
    getRevenueReport: (filters?: ReportFilters) =>
        api.get<ReportData>(`/api/provider/reports/revenue${buildQueryString(filters)}`),
    getBookingsReport: (filters?: ReportFilters) =>
        api.get<ReportData>(`/api/provider/reports/bookings${buildQueryString(filters)}`),
    getCustomersReport: (filters?: ReportFilters) =>
        api.get<ReportData>(`/api/provider/reports/customers${buildQueryString(filters)}`),
    getServicesReport: (filters?: ReportFilters) =>
        api.get<ReportData>(`/api/provider/reports/services${buildQueryString(filters)}`),
    getEmployeesReport: (filters?: ReportFilters) =>
        api.get<ReportData>(`/api/provider/reports/employees${buildQueryString(filters)}`),
    getFinancialReport: (filters?: ReportFilters) =>
        api.get<ReportData>(`/api/provider/reports/financial${buildQueryString(filters)}`),
    exportReport: (type: string, format: 'csv' | 'pdf', filters?: ReportFilters) =>
        api.get<{ url: string }>(`/api/provider/reports/${type}/export${buildQueryString({ ...filters, format })}`),
};

export const marketingApi = {
    // Offers
    getOffers: (filters?: PaginationParams & { active?: boolean }) =>
        api.get<Offer[]>(`/api/provider/marketing/offers${buildQueryString(filters)}`),
    getOffer: (uuid: string) => api.get<Offer>(`/api/provider/marketing/offers/${uuid}`),
    createOffer: (data: Record<string, unknown>) => api.post<Offer>('/api/provider/marketing/offers', data),
    updateOffer: (uuid: string, data: Record<string, unknown>) =>
        api.put<Offer>(`/api/provider/marketing/offers/${uuid}`, data),
    deleteOffer: (uuid: string) => api.delete(`/api/provider/marketing/offers/${uuid}`),
    toggleOfferActive: (uuid: string, active: boolean) =>
        api.patch(`/api/provider/marketing/offers/${uuid}/active`, { active }),

    // Promo Codes
    getPromoCodes: (filters?: PaginationParams & { active?: boolean }) =>
        api.get<PromoCode[]>(`/api/provider/marketing/promo-codes${buildQueryString(filters)}`),
    getPromoCode: (uuid: string) => api.get<PromoCode>(`/api/provider/marketing/promo-codes/${uuid}`),
    createPromoCode: (data: Record<string, unknown>) =>
        api.post<PromoCode>('/api/provider/marketing/promo-codes', data),
    updatePromoCode: (uuid: string, data: Record<string, unknown>) =>
        api.put<PromoCode>(`/api/provider/marketing/promo-codes/${uuid}`, data),
    deletePromoCode: (uuid: string) => api.delete(`/api/provider/marketing/promo-codes/${uuid}`),

    // Messages
    getMessages: (filters?: PaginationParams & { status?: string; type?: string }) =>
        api.get<MarketingMessage[]>(`/api/provider/marketing/messages${buildQueryString(filters)}`),
    getMessage: (uuid: string) => api.get<MarketingMessage>(`/api/provider/marketing/messages/${uuid}`),
    createMessage: (data: Record<string, unknown>) =>
        api.post<MarketingMessage>('/api/provider/marketing/messages', data),
    sendMessage: (uuid: string) => api.patch(`/api/provider/marketing/messages/${uuid}/send`),
    deleteMessage: (uuid: string) => api.delete(`/api/provider/marketing/messages/${uuid}`),

    // Templates
    getTemplates: (filters?: PaginationParams & { type?: string }) =>
        api.get<MessageTemplate[]>(`/api/provider/marketing/templates${buildQueryString(filters)}`),
    getTemplate: (uuid: string) => api.get<MessageTemplate>(`/api/provider/marketing/templates/${uuid}`),
    createTemplate: (data: Record<string, unknown>) =>
        api.post<MessageTemplate>('/api/provider/marketing/templates', data),
    updateTemplate: (uuid: string, data: Record<string, unknown>) =>
        api.put<MessageTemplate>(`/api/provider/marketing/templates/${uuid}`, data),
    deleteTemplate: (uuid: string) => api.delete(`/api/provider/marketing/templates/${uuid}`),

    // Push Notifications
    getNotifications: (filters?: PaginationParams) =>
        api.get<MarketingMessage[]>(`/api/provider/marketing/notifications${buildQueryString(filters)}`),
    sendNotification: (data: Record<string, unknown>) =>
        api.post<MarketingMessage>('/api/provider/marketing/notifications', data),

    // Packages
    getPackages: (filters?: PaginationParams & { active?: boolean }) =>
        api.get<MarketingPackage[]>(`/api/provider/marketing/packages${buildQueryString(filters)}`),
    getPackage: (uuid: string) => api.get<MarketingPackage>(`/api/provider/marketing/packages/${uuid}`),
    createPackage: (data: Record<string, unknown>) =>
        api.post<MarketingPackage>('/api/provider/marketing/packages', data),
    updatePackage: (uuid: string, data: Record<string, unknown>) =>
        api.put<MarketingPackage>(`/api/provider/marketing/packages/${uuid}`, data),
    deletePackage: (uuid: string) => api.delete(`/api/provider/marketing/packages/${uuid}`),

    // Service Groups
    getServiceGroups: (filters?: PaginationParams) =>
        api.get<Record<string, unknown>[]>(`/api/provider/marketing/service-groups${buildQueryString(filters)}`),
    createServiceGroup: (data: Record<string, unknown>) => api.post('/api/provider/marketing/service-groups', data),
    updateServiceGroup: (uuid: string, data: Record<string, unknown>) =>
        api.put(`/api/provider/marketing/service-groups/${uuid}`, data),
    deleteServiceGroup: (uuid: string) => api.delete(`/api/provider/marketing/service-groups/${uuid}`),

    // Announcements
    getAnnouncements: (filters?: PaginationParams & { status?: string }) =>
        api.get<Announcement[]>(`/api/provider/marketing/announcements${buildQueryString(filters)}`),
    getAnnouncement: (uuid: string) => api.get<Announcement>(`/api/provider/marketing/announcements/${uuid}`),
    createAnnouncement: (data: Record<string, unknown>) =>
        api.post<Announcement>('/api/provider/marketing/announcements', data),
    updateAnnouncement: (uuid: string, data: Record<string, unknown>) =>
        api.put<Announcement>(`/api/provider/marketing/announcements/${uuid}`, data),
    deleteAnnouncement: (uuid: string) => api.delete(`/api/provider/marketing/announcements/${uuid}`),
    publishAnnouncement: (uuid: string) => api.patch(`/api/provider/marketing/announcements/${uuid}/publish`),
};

export const salesApi = {
    getSales: (filters?: PaginationParams & { from_date?: string; to_date?: string }) =>
        api.get<Sale[]>(`/api/provider/sales${buildQueryString(filters)}`),
    getSale: (uuid: string) => api.get<Sale>(`/api/provider/sales/${uuid}`),
    createSale: (data: Record<string, unknown>) => api.post<Sale>('/api/provider/sales', data),
    voidSale: (uuid: string) => api.patch(`/api/provider/sales/${uuid}/void`),

    // Packages
    getPackageSales: (filters?: PaginationParams) =>
        api.get<Record<string, unknown>[]>(`/api/provider/sales/packages${buildQueryString(filters)}`),
    createPackageSale: (data: Record<string, unknown>) => api.post('/api/provider/sales/packages', data),
};

export const returnApi = {
    getReturns: (filters?: PaginationParams & { type?: string; status?: string }) =>
        api.get<Return[]>(`/api/provider/returns${buildQueryString(filters)}`),
    getReturn: (uuid: string) => api.get<Return>(`/api/provider/returns/${uuid}`),
    createReturn: (data: Record<string, unknown>) => api.post<Return>('/api/provider/returns', data),
    approveReturn: (uuid: string) => api.patch(`/api/provider/returns/${uuid}/approve`),
    rejectReturn: (uuid: string, reason: string) => api.patch(`/api/provider/returns/${uuid}/reject`, { reason }),
};

export const expenseApi = {
    getExpenses: (
        filters?: PaginationParams & { category?: string; status?: string; from_date?: string; to_date?: string }
    ) => api.get<Expense[]>(`/api/provider/expenses${buildQueryString(filters)}`),
    getExpense: (uuid: string) => api.get<Expense>(`/api/provider/expenses/${uuid}`),
    createExpense: (data: Record<string, unknown>) => api.post<Expense>('/api/provider/expenses', data),
    updateExpense: (uuid: string, data: Record<string, unknown>) =>
        api.put<Expense>(`/api/provider/expenses/${uuid}`, data),
    deleteExpense: (uuid: string) => api.delete(`/api/provider/expenses/${uuid}`),
    approveExpense: (uuid: string) => api.patch(`/api/provider/expenses/${uuid}/approve`),
    rejectExpense: (uuid: string) => api.patch(`/api/provider/expenses/${uuid}/reject`),
};

export const payrollApi = {
    getPayroll: (filters?: PaginationParams & { period?: string; status?: string }) =>
        api.get<PayrollRecord[]>(`/api/provider/payroll${buildQueryString(filters)}`),
    getPayrollRecord: (uuid: string) => api.get<PayrollRecord>(`/api/provider/payroll/${uuid}`),
    generatePayroll: (data: Record<string, unknown>) =>
        api.post<PayrollRecord[]>('/api/provider/payroll/generate', data),
    approvePayroll: (uuid: string) => api.patch(`/api/provider/payroll/${uuid}/approve`),
    markPaid: (uuid: string, data: Record<string, unknown>) => api.patch(`/api/provider/payroll/${uuid}/pay`, data),
    exportPayroll: (filters?: Record<string, unknown>) =>
        api.get<{ url: string }>(`/api/provider/payroll/export${buildQueryString(filters)}`),

    // Commissions
    getCommissions: (filters?: PaginationParams & { employee_uuid?: string; period?: string }) =>
        api.get<Commission[]>(`/api/provider/commissions${buildQueryString(filters)}`),

    // Commission Rules
    getCommissionRules: () => api.get<CommissionRule[]>('/api/provider/commission-rules'),
    getCommissionRule: (uuid: string) => api.get<CommissionRule>(`/api/provider/commission-rules/${uuid}`),
    createCommissionRule: (data: Record<string, unknown>) =>
        api.post<CommissionRule>('/api/provider/commission-rules', data),
    updateCommissionRule: (uuid: string, data: Record<string, unknown>) =>
        api.put<CommissionRule>(`/api/provider/commission-rules/${uuid}`, data),
    deleteCommissionRule: (uuid: string) => api.delete(`/api/provider/commission-rules/${uuid}`),

    // Deductions
    getDeductions: (filters?: PaginationParams & { employee_uuid?: string }) =>
        api.get<Deduction[]>(`/api/provider/deductions${buildQueryString(filters)}`),
    createDeduction: (data: Record<string, unknown>) => api.post<Deduction>('/api/provider/deductions', data),
    deleteDeduction: (uuid: string) => api.delete(`/api/provider/deductions/${uuid}`),
};

export const employeeExtApi = {
    // Performance
    getPerformance: (filters?: PaginationParams & { period?: string }) =>
        api.get<EmployeePerformance[]>(`/api/provider/employee-performance${buildQueryString(filters)}`),

    // Targets
    getTargets: (filters?: PaginationParams & { employee_uuid?: string }) =>
        api.get<EmployeeTarget[]>(`/api/provider/employee-targets${buildQueryString(filters)}`),
    createTarget: (data: Record<string, unknown>) => api.post<EmployeeTarget>('/api/provider/employee-targets', data),
    updateTarget: (uuid: string, data: Record<string, unknown>) =>
        api.put<EmployeeTarget>(`/api/provider/employee-targets/${uuid}`, data),
    deleteTarget: (uuid: string) => api.delete(`/api/provider/employee-targets/${uuid}`),

    // Roles
    getRoles: () => api.get<Role[]>('/api/provider/roles'),
    getRole: (uuid: string) => api.get<Role>(`/api/provider/roles/${uuid}`),
    createRole: (data: Record<string, unknown>) => api.post<Role>('/api/provider/roles', data),
    updateRole: (uuid: string, data: Record<string, unknown>) => api.put<Role>(`/api/provider/roles/${uuid}`, data),
    deleteRole: (uuid: string) => api.delete(`/api/provider/roles/${uuid}`),

    // Positions
    getPositions: () => api.get<Position[]>('/api/provider/positions'),
    createPosition: (data: Record<string, unknown>) => api.post<Position>('/api/provider/positions', data),
    updatePosition: (uuid: string, data: Record<string, unknown>) =>
        api.put<Position>(`/api/provider/positions/${uuid}`, data),
    deletePosition: (uuid: string) => api.delete(`/api/provider/positions/${uuid}`),

    // Departments
    getDepartments: () => api.get<Department[]>('/api/provider/departments'),
    createDepartment: (data: Record<string, unknown>) => api.post<Department>('/api/provider/departments', data),
    updateDepartment: (uuid: string, data: Record<string, unknown>) =>
        api.put<Department>(`/api/provider/departments/${uuid}`, data),
    deleteDepartment: (uuid: string) => api.delete(`/api/provider/departments/${uuid}`),

    // Transfers
    getTransfers: (filters?: PaginationParams & { status?: string }) =>
        api.get<EmployeeTransfer[]>(`/api/provider/employee-transfers${buildQueryString(filters)}`),
    createTransfer: (data: Record<string, unknown>) =>
        api.post<EmployeeTransfer>('/api/provider/employee-transfers', data),
    approveTransfer: (uuid: string) => api.patch(`/api/provider/employee-transfers/${uuid}/approve`),
    rejectTransfer: (uuid: string) => api.patch(`/api/provider/employee-transfers/${uuid}/reject`),

    // Time Tracking
    getTimeTracking: (filters?: PaginationParams & { employee_uuid?: string; from_date?: string; to_date?: string }) =>
        api.get<TimeTrackingEntry[]>(`/api/provider/time-tracking${buildQueryString(filters)}`),

    // Fingerprints
    getFingerprints: (filters?: PaginationParams) =>
        api.get<FingerprintRecord[]>(`/api/provider/fingerprints${buildQueryString(filters)}`),
    enrollFingerprint: (data: Record<string, unknown>) =>
        api.post<FingerprintRecord>('/api/provider/fingerprints', data),

    // Attendance Methods
    getAttendanceMethods: () => api.get<AttendanceMethod[]>('/api/provider/attendance-methods'),
    updateAttendanceMethod: (uuid: string, data: Record<string, unknown>) =>
        api.put<AttendanceMethod>(`/api/provider/attendance-methods/${uuid}`, data),

    // Schedule (employee shift assignments)
    getSchedule: (filters?: { branch_uuid?: string; from_date?: string; to_date?: string }) =>
        api.get<Record<string, unknown>[]>(`/api/provider/schedule${buildQueryString(filters)}`),
    assignShift: (data: Record<string, unknown>) => api.post('/api/provider/schedule', data),
    removeShiftAssignment: (uuid: string) => api.delete(`/api/provider/schedule/${uuid}`),
};

export const settingsApi = {
    // Business Hours
    getBusinessHours: () => api.get<BusinessHours[]>('/api/provider/settings/business-hours'),
    updateBusinessHours: (data: Record<string, unknown>) =>
        api.put<BusinessHours[]>('/api/provider/settings/business-hours', data),

    // Payment Methods
    getPaymentMethods: () => api.get<PaymentMethod[]>('/api/provider/settings/payment-methods'),
    createPaymentMethod: (data: Record<string, unknown>) =>
        api.post<PaymentMethod>('/api/provider/settings/payment-methods', data),
    updatePaymentMethod: (uuid: string, data: Record<string, unknown>) =>
        api.put<PaymentMethod>(`/api/provider/settings/payment-methods/${uuid}`, data),
    deletePaymentMethod: (uuid: string) => api.delete(`/api/provider/settings/payment-methods/${uuid}`),

    // Safes
    getSafes: () => api.get<Safe[]>('/api/provider/settings/safes'),
    createSafe: (data: Record<string, unknown>) => api.post<Safe>('/api/provider/settings/safes', data),
    updateSafe: (uuid: string, data: Record<string, unknown>) =>
        api.put<Safe>(`/api/provider/settings/safes/${uuid}`, data),
    deleteSafe: (uuid: string) => api.delete(`/api/provider/settings/safes/${uuid}`),

    // Resources
    getResources: () => api.get<Resource[]>('/api/provider/settings/resources'),
    createResource: (data: Record<string, unknown>) => api.post<Resource>('/api/provider/settings/resources', data),
    updateResource: (uuid: string, data: Record<string, unknown>) =>
        api.put<Resource>(`/api/provider/settings/resources/${uuid}`, data),
    deleteResource: (uuid: string) => api.delete(`/api/provider/settings/resources/${uuid}`),

    // Invoice Settings
    getInvoiceSettings: () => api.get<InvoiceSettings>('/api/provider/settings/invoice'),
    updateInvoiceSettings: (data: Record<string, unknown>) =>
        api.put<InvoiceSettings>('/api/provider/settings/invoice', data),

    // Notification Settings
    getNotificationSettings: () => api.get<NotificationSetting[]>('/api/provider/settings/notifications'),
    updateNotificationSettings: (data: Record<string, unknown>) =>
        api.put<NotificationSetting[]>('/api/provider/settings/notifications', data),

    // Integrations
    getIntegrations: () => api.get<Integration[]>('/api/provider/settings/integrations'),
    connectIntegration: (uuid: string, data: Record<string, unknown>) =>
        api.post(`/api/provider/settings/integrations/${uuid}/connect`, data),
    disconnectIntegration: (uuid: string) => api.patch(`/api/provider/settings/integrations/${uuid}/disconnect`),

    // Subscription
    getSubscription: () => api.get<SubscriptionPlan[]>('/api/provider/settings/subscription'),
    changePlan: (data: Record<string, unknown>) => api.post('/api/provider/settings/subscription/change', data),

    // Audit Log
    getAuditLog: (
        filters?: PaginationParams & { action?: string; user_uuid?: string; from_date?: string; to_date?: string }
    ) => api.get<AuditLogEntry[]>(`/api/provider/settings/audit-log${buildQueryString(filters)}`),

    // Service Categories
    getServiceCategories: () => api.get<ServiceCategory[]>('/api/provider/settings/service-categories'),
    createServiceCategory: (data: Record<string, unknown>) =>
        api.post<ServiceCategory>('/api/provider/settings/service-categories', data),
    updateServiceCategory: (uuid: string, data: Record<string, unknown>) =>
        api.put<ServiceCategory>(`/api/provider/settings/service-categories/${uuid}`, data),
    deleteServiceCategory: (uuid: string) => api.delete(`/api/provider/settings/service-categories/${uuid}`),
    reorderServiceCategories: (uuids: string[]) =>
        api.put('/api/provider/settings/service-categories/reorder', { uuids }),

    // Service-Employee Mappings
    getServiceEmployees: () => api.get<ServiceEmployeeMapping[]>('/api/provider/settings/service-employees'),
    updateServiceEmployees: (data: Record<string, unknown>) =>
        api.put('/api/provider/settings/service-employees', data),

    // Diary Automations
    getDiaryAutomations: () => api.get<DiaryAutomation[]>('/api/provider/settings/diary-automations'),
    createDiaryAutomation: (data: Record<string, unknown>) =>
        api.post<DiaryAutomation>('/api/provider/settings/diary-automations', data),
    updateDiaryAutomation: (uuid: string, data: Record<string, unknown>) =>
        api.put<DiaryAutomation>(`/api/provider/settings/diary-automations/${uuid}`, data),
    deleteDiaryAutomation: (uuid: string) => api.delete(`/api/provider/settings/diary-automations/${uuid}`),

    // Shift Automations
    getShiftAutomations: () => api.get<ShiftAutomation[]>('/api/provider/settings/shift-automations'),
    createShiftAutomation: (data: Record<string, unknown>) =>
        api.post<ShiftAutomation>('/api/provider/settings/shift-automations', data),
    updateShiftAutomation: (uuid: string, data: Record<string, unknown>) =>
        api.put<ShiftAutomation>(`/api/provider/settings/shift-automations/${uuid}`, data),
    deleteShiftAutomation: (uuid: string) => api.delete(`/api/provider/settings/shift-automations/${uuid}`),

    // Petty Cash Items
    getPettyCashItems: () => api.get<PettyCashItem[]>('/api/provider/settings/petty-cash-items'),
    createPettyCashItem: (data: Record<string, unknown>) =>
        api.post<PettyCashItem>('/api/provider/settings/petty-cash-items', data),
    updatePettyCashItem: (uuid: string, data: Record<string, unknown>) =>
        api.put<PettyCashItem>(`/api/provider/settings/petty-cash-items/${uuid}`, data),
    deletePettyCashItem: (uuid: string) => api.delete(`/api/provider/settings/petty-cash-items/${uuid}`),

    // Appearance (optional – localStorage fallback)
    getAppearanceSettings: undefined as (() => Promise<ApiResponse<Record<string, unknown>>>) | undefined,
    updateAppearanceSettings: undefined as
        | ((data: Record<string, unknown>) => Promise<ApiResponse<Record<string, unknown>>>)
        | undefined,

    // Localization (optional – localStorage fallback)
    getLocalizationSettings: undefined as (() => Promise<ApiResponse<Record<string, unknown>>>) | undefined,
    updateLocalizationSettings: undefined as
        | ((data: Record<string, unknown>) => Promise<ApiResponse<Record<string, unknown>>>)
        | undefined,

    // Security (optional – localStorage fallback)
    getSecuritySettings: undefined as (() => Promise<ApiResponse<Record<string, unknown>>>) | undefined,
    updateSecuritySettings: undefined as
        | ((data: Record<string, unknown>) => Promise<ApiResponse<Record<string, unknown>>>)
        | undefined,

    // Data Management (optional – localStorage fallback)
    exportData: undefined as (() => Promise<ApiResponse<Record<string, unknown>>>) | undefined,
    importData: undefined as
        | ((data: Record<string, unknown>) => Promise<ApiResponse<Record<string, unknown>>>)
        | undefined,

    // Devices
    getDevices: undefined as (() => Promise<ApiResponse<Record<string, unknown>[]>>) | undefined,

    // Fingerprint Areas
    getFingerprintAreas: undefined as (() => Promise<ApiResponse<Record<string, unknown>[]>>) | undefined,
    createFingerprintArea: undefined as
        | ((data: Record<string, unknown>) => Promise<ApiResponse<Record<string, unknown>>>)
        | undefined,
    updateFingerprintArea: undefined as
        | ((uuid: string, data: Record<string, unknown>) => Promise<ApiResponse<Record<string, unknown>>>)
        | undefined,
    deleteFingerprintArea: undefined as ((uuid: string) => Promise<ApiResponse<unknown>>) | undefined,

    // Fingerprint Devices
    getFingerprintDevices: undefined as (() => Promise<ApiResponse<Record<string, unknown>[]>>) | undefined,
    createFingerprintDevice: undefined as
        | ((data: Record<string, unknown>) => Promise<ApiResponse<Record<string, unknown>>>)
        | undefined,
    deleteFingerprintDevice: undefined as ((uuid: string) => Promise<ApiResponse<unknown>>) | undefined,

    // Tipping
    getTipConfig: () => api.get<TipConfig>('/api/provider/settings/tipping'),
    updateTipConfig: (data: Record<string, unknown>) => api.put<TipConfig>('/api/provider/settings/tipping', data),
    getTips: (filters?: PaginationParams & { employee_uuid?: string; from_date?: string; to_date?: string }) =>
        api.get<Tip[]>(`/api/provider/tips${buildQueryString(filters)}`),

    // Loyalty
    getLoyaltyConfig: () => api.get<LoyaltyConfig>('/api/provider/settings/loyalty'),
    updateLoyaltyConfig: (data: Record<string, unknown>) =>
        api.put<LoyaltyConfig>('/api/provider/settings/loyalty', data),
    getCustomerLoyalty: (customerUuid: string) =>
        api.get<LoyaltyTransaction[]>(`/api/provider/customers/${customerUuid}/loyalty`),
};

export const waitlistApi = {
    getWaitlist: (filters?: PaginationParams & { branch_uuid?: string; status?: string }) =>
        api.get<WaitlistEntry[]>(`/api/provider/waitlist${buildQueryString(filters)}`),
    addToWaitlist: (data: Record<string, unknown>) => api.post<WaitlistEntry>('/api/provider/waitlist', data),
    updateWaitlistEntry: (uuid: string, data: Record<string, unknown>) =>
        api.put<WaitlistEntry>(`/api/provider/waitlist/${uuid}`, data),
    removeFromWaitlist: (uuid: string) => api.delete(`/api/provider/waitlist/${uuid}`),
    notifyWaitlistEntry: (uuid: string) => api.patch(`/api/provider/waitlist/${uuid}/notify`),
};

export const bugReportApi = {
    submitBugReport: (data: Record<string, unknown>) => api.post<BugReport>('/api/provider/bug-reports', data),
    uploadScreenshot: (formData: FormData) =>
        api.postFormData<{ url: string }>('/api/provider/bug-reports/screenshot', formData),
};

// Extend providerApi with booking create/update
export const bookingApi = {
    ...providerApi,
    createBooking: (data: Record<string, unknown>) => api.post<Booking>('/api/provider/bookings', data),
    updateBooking: (uuid: string, data: Record<string, unknown>) =>
        api.put<Booking>(`/api/provider/bookings/${uuid}`, data),
};

// ── Image URL Helper ───────────────────────────────────

export function getImageUrl(type: string, uuid: string): string {
    return `${API_BASE_URL}/api/images/${type}/${uuid}`;
}
