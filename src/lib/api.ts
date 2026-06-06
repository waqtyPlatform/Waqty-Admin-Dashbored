// Use the Next.js rewrite proxy (/api-proxy/*) in the browser to avoid CORS.
// On the server (SSR/build), hit the real API directly.
const API_BASE_URL =
    typeof window !== 'undefined'
        ? '/api-proxy'
        : (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://waqty.alemtayaz.shop/public/api');

export interface Pagination {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

export interface ApiMeta {
    pagination?: Pagination;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    meta?: ApiMeta;
}

/** Typed error thrown for every non-2xx response */
export class ApiError extends Error {
    constructor(
        public readonly status: number,
        message: string,
        /** Field-level validation errors (422) */
        public readonly errors?: Record<string, string[]>
    ) {
        super(message);
        this.name = 'ApiError';
    }

    get isUnauthorized() { return this.status === 401; }
    get isForbidden()    { return this.status === 403; }
    get isNotFound()     { return this.status === 404; }
    get isValidation()   { return this.status === 422; }
    get isRateLimit()    { return this.status === 429; }
    get isServerError()  { return this.status >= 500; }
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private getToken(): string | null {
        if (typeof window === 'undefined') return null;
        // App-scoped token key (X11) — never the shared `waqty_token`, so logging
        // into another Waqty web app can't clobber the super-admin session.
        return localStorage.getItem('waqty_superadmin_token');
    }

    async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
        const token = this.getToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'Accept-Language': typeof window !== 'undefined' ? localStorage.getItem('waqty_language') || 'en' : 'en',
            ...(options.headers as Record<string, string>),
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
        });

        const body: ApiResponse<T> = await response.json();

        if (!response.ok) {
            // 401 — clear stored credentials so the proxy redirects to login
            if (response.status === 401 && typeof window !== 'undefined') {
                localStorage.removeItem('waqty_superadmin_token');
                document.cookie = 'waqty_superadmin_logged_in=; Max-Age=0; path=/';
                document.cookie = 'waqty_superadmin_auth=; Max-Age=0; path=/';
            }

            // 422 — extract field-level validation errors
            const validationErrors =
                response.status === 422 && body && typeof body === 'object' && 'errors' in body
                    ? (body as { errors: Record<string, string[]> }).errors
                    : undefined;

            throw new ApiError(
                response.status,
                body?.message ?? response.statusText,
                validationErrors
            );
        }

        return body;
    }

    async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<ApiResponse<T>> {
        let url = endpoint;
        if (params) {
            const qs = new URLSearchParams(
                Object.entries(params)
                    .filter(([, v]) => v !== undefined && v !== '')
                    .map(([k, v]) => [k, String(v)])
            ).toString();
            if (qs) url = `${endpoint}?${qs}`;
        }
        return this.request<T>(url, { method: 'GET' });
    }

    async post<T>(endpoint: string, body: Record<string, unknown>): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
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
            'Accept-Language': typeof window !== 'undefined' ? localStorage.getItem('waqty_language') || 'en' : 'en',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData,
        });
        const body: ApiResponse<T> = await response.json();
        if (!response.ok) {
            const validationErrors =
                response.status === 422 && body && typeof body === 'object' && 'errors' in body
                    ? (body as { errors: Record<string, string[]> }).errors
                    : undefined;
            throw new ApiError(response.status, body?.message ?? response.statusText, validationErrors);
        }
        return body;
    }

    async putFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
        // Laravel method spoofing: add _method=PUT so server treats it as PUT
        formData.append('_method', 'PUT');
        return this.postFormData<T>(endpoint, formData);
    }
}

export const api = new ApiClient(API_BASE_URL);

// ── Admin Auth Types ────────────────────────────────────

export interface AdminObject {
    id: number;
    name: string;
    email: string;
    active: boolean;
    // Backend-assigned RBAC role. Optional until the API exposes it; when present
    // it is honoured verbatim instead of assuming super_admin (X12).
    role?: string | null;
}

export interface AdminLoginResponse {
    token: string;
    token_type: 'Bearer';
    expires_in: number;
    admin: AdminObject;
}

// ── Admin Auth API ──────────────────────────────────────

export const adminAuthApi = {
    /**
     * POST /admin/auth/send-verification-otp
     * Public. Throttle: 5 req/min.
     * Sends an OTP to the given admin email.
     */
    sendVerificationOtp: (email: string) =>
        api.post('/admin/auth/send-verification-otp', { email }),

    /**
     * POST /admin/auth/verify-email
     * Public. Throttle: 5 req/min.
     * Verifies the OTP — returns JWT token + admin object.
     */
    verifyEmail: (email: string, otp: string) =>
        api.post<AdminLoginResponse>('/admin/auth/verify-email', { email, otp }),

    /**
     * POST /admin/auth/resend-verification-otp
     * Public. Throttle: 5 req/min.
     * Resends the verification OTP.
     */
    resendVerificationOtp: (email: string) =>
        api.post('/admin/auth/resend-verification-otp', { email }),

    /**
     * POST /admin/auth/login
     * Public.
     * Login with email + password — returns JWT token + admin object.
     */
    login: (email: string, password: string) =>
        api.post<AdminLoginResponse>('/admin/auth/login', { email, password }),

    /**
     * POST /admin/auth/logout
     * Requires authentication.
     * Invalidates the current JWT token.
     */
    logout: () =>
        api.post('/admin/auth/logout', {}),

    /**
     * GET /admin/auth/me
     * Requires authentication.
     * Returns the currently authenticated admin.
     */
    me: () =>
        api.get<AdminObject>('/admin/auth/me'),
};

// ── Admins Management API ───────────────────────────────

export interface AdminListFilters {
    search?: string;
    active?: boolean;
    per_page?: number;
    page?: number;
}

export interface CreateAdminBody {
    name: string;
    email: string;
    password: string;
    active?: boolean;
}

export interface UpdateAdminBody {
    name: string;
    email: string;
    password?: string;
    active?: boolean;
}

export const adminsApi = {
    /** GET /admin/admins — paginated list */
    list: (filters?: AdminListFilters) =>
        api.get<AdminObject[]>('/admin/admins', {
            ...(filters?.search   !== undefined && { search: filters.search }),
            ...(filters?.active   !== undefined && { active: String(filters.active) }),
            ...(filters?.per_page !== undefined && { per_page: filters.per_page }),
            ...(filters?.page     !== undefined && { page: filters.page }),
        }),

    /** GET /admin/admins/{id} */
    get: (id: number) =>
        api.get<AdminObject>(`/admin/admins/${id}`),

    /** POST /admin/admins */
    create: (body: CreateAdminBody) =>
        api.post<AdminObject>('/admin/admins', body as unknown as Record<string, unknown>),

    /** PUT /admin/admins/{id} */
    update: (id: number, body: UpdateAdminBody) =>
        api.put<AdminObject>(`/admin/admins/${id}`, body as unknown as Record<string, unknown>),

    /** PATCH /admin/admins/{id}/active */
    toggleActive: (id: number, active: boolean) =>
        api.patch<AdminObject>(`/admin/admins/${id}/active`, { active }),
};

// ── Countries API ───────────────────────────────────────

export interface CountryName { ar: string; en: string; }

export interface CountryObject {
    uuid: string;
    name: CountryName;
    iso2?: string;
    phone_code?: string;
    active: boolean;
    sort_order?: number;
    deleted_at?: string | null;
}

export interface CountryListFilters {
    search?: string;
    active?: boolean;
    trashed?: 'only' | 'with';
    per_page?: number;
    page?: number;
}

export interface CountryBody {
    name: { ar: string; en: string };
    iso2?: string;
    phone_code?: string;
    active?: boolean;
    sort_order?: number;
}

export const countriesApi = {
    list: (filters?: CountryListFilters) =>
        api.get<CountryObject[]>('/admin/countries', {
            ...(filters?.search   !== undefined && { search: filters.search }),
            ...(filters?.active   !== undefined && { active: String(filters.active) }),
            ...(filters?.trashed  !== undefined && { trashed: filters.trashed }),
            ...(filters?.per_page !== undefined && { per_page: filters.per_page }),
            ...(filters?.page     !== undefined && { page: filters.page }),
        }),
    get: (uuid: string) =>
        api.get<CountryObject>(`/admin/countries/${uuid}`),
    create: (body: CountryBody) =>
        api.post<CountryObject>('/admin/countries', body as unknown as Record<string, unknown>),
    update: (uuid: string, body: Partial<CountryBody>) =>
        api.put<CountryObject>(`/admin/countries/${uuid}`, body as unknown as Record<string, unknown>),
    delete: (uuid: string) =>
        api.delete<null>(`/admin/countries/${uuid}`),
    toggleActive: (uuid: string, active: boolean) =>
        api.patch<CountryObject>(`/admin/countries/${uuid}/active`, { active }),
    restore: (uuid: string) =>
        api.post<CountryObject>(`/admin/countries/${uuid}/restore`, {}),
    forceDelete: (uuid: string) =>
        api.delete<null>(`/admin/countries/${uuid}/force`),
};

// ── Cities API ──────────────────────────────────────────

export interface CityObject {
    uuid: string;
    name: CountryName;
    country_uuid: string;
    active: boolean;
    sort_order?: number;
    deleted_at?: string | null;
}

export interface CityListFilters {
    search?: string;
    active?: boolean;
    country_uuid?: string;
    trashed?: 'only' | 'with';
    per_page?: number;
    page?: number;
}

export interface CityBody {
    name: { ar: string; en: string };
    country_uuid: string;
    active?: boolean;
    sort_order?: number;
}

export const citiesApi = {
    list: (filters?: CityListFilters) =>
        api.get<CityObject[]>('/admin/cities', {
            ...(filters?.search       !== undefined && { search: filters.search }),
            ...(filters?.active       !== undefined && { active: String(filters.active) }),
            ...(filters?.country_uuid !== undefined && { country_uuid: filters.country_uuid }),
            ...(filters?.trashed      !== undefined && { trashed: filters.trashed }),
            ...(filters?.per_page     !== undefined && { per_page: filters.per_page }),
            ...(filters?.page         !== undefined && { page: filters.page }),
        }),
    get: (uuid: string) =>
        api.get<CityObject>(`/admin/cities/${uuid}`),
    create: (body: CityBody) =>
        api.post<CityObject>('/admin/cities', body as unknown as Record<string, unknown>),
    update: (uuid: string, body: Partial<CityBody>) =>
        api.put<CityObject>(`/admin/cities/${uuid}`, body as unknown as Record<string, unknown>),
    delete: (uuid: string) =>
        api.delete<null>(`/admin/cities/${uuid}`),
    toggleActive: (uuid: string, active: boolean) =>
        api.patch<CityObject>(`/admin/cities/${uuid}/active`, { active }),
    restore: (uuid: string) =>
        api.post<CityObject>(`/admin/cities/${uuid}/restore`, {}),
    forceDelete: (uuid: string) =>
        api.delete<null>(`/admin/cities/${uuid}/force`),
};

// ── Governorates API ────────────────────────────────────

export interface GovernorateObject {
    uuid: string;
    name: CountryName;
    country_uuid: string;
    active: boolean;
    sort_order?: number;
    deleted_at?: string | null;
}

export interface GovernorateListFilters {
    search?: string;
    active?: boolean;
    country_uuid?: string;
    trashed?: 'only' | 'with';
    per_page?: number;
    page?: number;
}

export interface GovernorateBody {
    name: { ar: string; en: string };
    country_uuid: string;
    active?: boolean;
    sort_order?: number;
}

export const governoratesApi = {
    list: (filters?: GovernorateListFilters) =>
        api.get<GovernorateObject[]>('/admin/governorates', {
            ...(filters?.search       !== undefined && { search: filters.search }),
            ...(filters?.active       !== undefined && { active: String(filters.active) }),
            ...(filters?.country_uuid !== undefined && { country_uuid: filters.country_uuid }),
            ...(filters?.trashed      !== undefined && { trashed: filters.trashed }),
            ...(filters?.per_page     !== undefined && { per_page: filters.per_page }),
            ...(filters?.page         !== undefined && { page: filters.page }),
        }),
    get: (uuid: string) =>
        api.get<GovernorateObject>(`/admin/governorates/${uuid}`),
    create: (body: GovernorateBody) =>
        api.post<GovernorateObject>('/admin/governorates', body as unknown as Record<string, unknown>),
    update: (uuid: string, body: Partial<GovernorateBody>) =>
        api.put<GovernorateObject>(`/admin/governorates/${uuid}`, body as unknown as Record<string, unknown>),
    delete: (uuid: string) =>
        api.delete<null>(`/admin/governorates/${uuid}`),
    toggleActive: (uuid: string, active: boolean) =>
        api.patch<GovernorateObject>(`/admin/governorates/${uuid}/active`, { active }),
    restore: (uuid: string) =>
        api.post<GovernorateObject>(`/admin/governorates/${uuid}/restore`, {}),
    forceDelete: (uuid: string) =>
        api.delete<null>(`/admin/governorates/${uuid}/force`),
};

// ── Payments API ────────────────────────────────────────

export type PaymentMethodType = 'cash' | 'paymob';
// Live /admin/payments wire status — the backend's own enum (it uses 'completed'
// where the canonical ledger uses 'paid'). Named distinctly (SA-8′) so it does
// NOT shadow the contract's canonical `PaymentStatus` re-exported from here; this
// is the gateway DTO status, not the ecosystem ledger status.
export type ApiPaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface PaymentObject {
    uuid: string;
    payment_method: PaymentMethodType;
    amount: number;
    status: ApiPaymentStatus;
    transaction_id?: string | null;
    notes?: string | null;
    booking_uuid?: string | null;
    provider_uuid?: string | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface PaymentListFilters {
    payment_method?: PaymentMethodType;
    status?: ApiPaymentStatus;
    booking_uuid?: string;
    provider_uuid?: string;
    from_date?: string;
    to_date?: string;
    trashed?: 'only' | 'with';
    per_page?: number;
    page?: number;
}

export interface UpdatePaymentBody {
    payment_method?: PaymentMethodType;
    amount?: number;
    status?: ApiPaymentStatus;
    transaction_id?: string;
    notes?: string;
}

// ── Wire <-> canonical payment-status bridge (G4) ──────────
// The gateway speaks ApiPaymentStatus ('completed'); the ecosystem ledger speaks
// the canonical PaymentStatus ('paid', plus a 'partial' the wire has no word for).
// These two functions are the ONLY sanctioned crossing between the vocabularies —
// hydrate wire payments into the ledger through toPaymentStatus().
export function toPaymentStatus(wire: ApiPaymentStatus): PaymentStatus {
    switch (wire) {
        case 'completed': return 'paid';
        case 'pending':   return 'pending';
        case 'failed':    return 'failed';
        case 'refunded':  return 'refunded';
    }
}

// Reverse map for writes back to the gateway. LOSSY: canonical 'partial' (deposit
// paid, balance still due) has no wire equivalent, so it collapses to 'pending'
// (still owed) — never assume round-trip fidelity through the wire.
export function toApiPaymentStatus(status: PaymentStatus): ApiPaymentStatus {
    switch (status) {
        case 'paid':     return 'completed';
        case 'partial':  return 'pending';
        case 'pending':  return 'pending';
        case 'refunded': return 'refunded';
        case 'failed':   return 'failed';
    }
}

export const paymentsApi = {
    /** GET /admin/payments */
    list: (filters?: PaymentListFilters) =>
        api.get<PaymentObject[]>('/admin/payments', {
            ...(filters?.payment_method !== undefined && { payment_method: filters.payment_method }),
            ...(filters?.status         !== undefined && { status: filters.status }),
            ...(filters?.booking_uuid   !== undefined && { booking_uuid: filters.booking_uuid }),
            ...(filters?.provider_uuid  !== undefined && { provider_uuid: filters.provider_uuid }),
            ...(filters?.from_date      !== undefined && { from_date: filters.from_date }),
            ...(filters?.to_date        !== undefined && { to_date: filters.to_date }),
            ...(filters?.trashed        !== undefined && { trashed: filters.trashed }),
            ...(filters?.per_page       !== undefined && { per_page: filters.per_page }),
            ...(filters?.page           !== undefined && { page: filters.page }),
        }),

    /** GET /admin/payments/{uuid} */
    get: (uuid: string) =>
        api.get<PaymentObject>(`/admin/payments/${uuid}`),

    /** PUT /admin/payments/{uuid} */
    update: (uuid: string, body: UpdatePaymentBody) =>
        api.put<PaymentObject>(`/admin/payments/${uuid}`, body as unknown as Record<string, unknown>),

    /** DELETE /admin/payments/{uuid} */
    delete: (uuid: string) =>
        api.delete<null>(`/admin/payments/${uuid}`),
};

// ── Admin Providers API ─────────────────────────────────

export interface AdminProviderObject {
    uuid: string;
    name: string;
    name_ar?: string | null;
    email: string;
    phone: string;
    code?: string | null;
    active: boolean;
    blocked: boolean;
    banned: boolean;
    country_id?: number | null;
    city_id?: number | null;
    category_id?: number | null;
    category?: { uuid: string; name: string } | null;
    branches?: Array<{ uuid: string; name: string; phone: string }>;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface AdminProviderListFilters {
    search?: string;
    active?: boolean;
    blocked?: boolean;
    banned?: boolean;
    country_id?: number;
    city_id?: number;
    category_id?: number;
    trashed?: boolean;
    per_page?: number;
    page?: number;
}

export const adminProvidersApi = {
    /** GET /admin/providers */
    list: (filters?: AdminProviderListFilters) =>
        api.get<AdminProviderObject[]>('/admin/providers', {
            ...(filters?.search      !== undefined && { search: filters.search }),
            ...(filters?.active      !== undefined && { active: String(filters.active) }),
            ...(filters?.blocked     !== undefined && { blocked: String(filters.blocked) }),
            ...(filters?.banned      !== undefined && { banned: String(filters.banned) }),
            ...(filters?.country_id  !== undefined && { country_id: filters.country_id }),
            ...(filters?.city_id     !== undefined && { city_id: filters.city_id }),
            ...(filters?.category_id !== undefined && { category_id: filters.category_id }),
            ...(filters?.trashed     !== undefined && { trashed: String(filters.trashed) }),
            ...(filters?.per_page    !== undefined && { per_page: filters.per_page }),
            ...(filters?.page        !== undefined && { page: filters.page }),
        }),

    /** GET /admin/providers/{uuid} */
    get: (uuid: string) =>
        api.get<AdminProviderObject>(`/admin/providers/${uuid}`),

    /** PATCH /admin/providers/{uuid}/active */
    toggleActive: (uuid: string, active: boolean) =>
        api.patch<AdminProviderObject>(`/admin/providers/${uuid}/active`, { active }),

    /** PATCH /admin/providers/{uuid}/block */
    block: (uuid: string, blocked: boolean, reason?: string) =>
        api.patch<AdminProviderObject>(`/admin/providers/${uuid}/block`, { blocked, ...(reason && { reason }) }),

    /** PATCH /admin/providers/{uuid}/ban */
    ban: (uuid: string, banned: boolean, reason?: string) =>
        api.patch<AdminProviderObject>(`/admin/providers/${uuid}/ban`, { banned, ...(reason && { reason }) }),

    /** DELETE /admin/providers/{uuid} */
    delete: (uuid: string) =>
        api.delete<null>(`/admin/providers/${uuid}`),

    /** POST /admin/providers/{uuid}/restore */
    restore: (uuid: string) =>
        api.post<AdminProviderObject>(`/admin/providers/${uuid}/restore`, {}),

    /** DELETE /admin/providers/{uuid}/force */
    forceDelete: (uuid: string) =>
        api.delete<null>(`/admin/providers/${uuid}/force`),
};

// ── Admin Provider Branches API ─────────────────────────

export interface BranchObject {
    uuid: string;
    name: string;
    phone?: string | null;
    provider_uuid?: string | null;
    country_uuid?: string | null;
    city_uuid?: string | null;
    category_uuid?: string | null;
    active: boolean;
    blocked: boolean;
    banned: boolean;
    is_main: boolean;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface BranchListFilters {
    provider_uuid?: string;
    country_uuid?: string;
    city_uuid?: string;
    category_uuid?: string;
    active?: boolean;
    blocked?: boolean;
    banned?: boolean;
    is_main?: boolean;
    search?: string;
    trashed?: 'only' | 'with';
    per_page?: number;
    page?: number;
}

export interface UpdateBranchStatusBody {
    active?: boolean;
    blocked?: boolean;
    banned?: boolean;
}

export const adminBranchesApi = {
    /** GET /admin/provider-branches */
    list: (filters?: BranchListFilters) =>
        api.get<BranchObject[]>('/admin/provider-branches', {
            ...(filters?.provider_uuid !== undefined && { provider_uuid: filters.provider_uuid }),
            ...(filters?.country_uuid  !== undefined && { country_uuid: filters.country_uuid }),
            ...(filters?.city_uuid     !== undefined && { city_uuid: filters.city_uuid }),
            ...(filters?.category_uuid !== undefined && { category_uuid: filters.category_uuid }),
            ...(filters?.active        !== undefined && { active: String(filters.active) }),
            ...(filters?.blocked       !== undefined && { blocked: String(filters.blocked) }),
            ...(filters?.banned        !== undefined && { banned: String(filters.banned) }),
            ...(filters?.is_main       !== undefined && { is_main: String(filters.is_main) }),
            ...(filters?.search        !== undefined && { search: filters.search }),
            ...(filters?.trashed       !== undefined && { trashed: filters.trashed }),
            ...(filters?.per_page      !== undefined && { per_page: filters.per_page }),
            ...(filters?.page          !== undefined && { page: filters.page }),
        }),

    /** GET /admin/provider-branches/{uuid} */
    get: (uuid: string) =>
        api.get<BranchObject>(`/admin/provider-branches/${uuid}`),

    /** PATCH /admin/provider-branches/{uuid}/status */
    updateStatus: (uuid: string, body: UpdateBranchStatusBody) =>
        api.patch<BranchObject>(`/admin/provider-branches/${uuid}/status`, body as unknown as Record<string, unknown>),

    /** DELETE /admin/provider-branches/{uuid} */
    delete: (uuid: string) =>
        api.delete<null>(`/admin/provider-branches/${uuid}`),

    /** POST /admin/provider-branches/{uuid}/restore */
    restore: (uuid: string) =>
        api.post<BranchObject>(`/admin/provider-branches/${uuid}/restore`, {}),
};

// ── Admin Categories API ────────────────────────────────

export interface AdminCategoryName { ar: string; en: string; }

export interface AdminCategoryObject {
    uuid: string;
    name: AdminCategoryName;
    image_url?: string | null;
    active: boolean;
    sort_order?: number;
    subcategories_count?: number;
    subcategories?: AdminSubcategoryObject[];
    deleted_at?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface AdminCategoryListFilters {
    search?: string;
    active?: boolean;
    trashed?: 'only' | 'with';
    per_page?: number;
    page?: number;
}

export const adminCategoriesApi = {
    /** GET /admin/categories */
    list: (filters?: AdminCategoryListFilters) =>
        api.get<AdminCategoryObject[]>('/admin/categories', {
            ...(filters?.search   !== undefined && { search: filters.search }),
            ...(filters?.active   !== undefined && { active: String(filters.active) }),
            ...(filters?.trashed  !== undefined && { trashed: filters.trashed }),
            ...(filters?.per_page !== undefined && { per_page: filters.per_page }),
            ...(filters?.page     !== undefined && { page: filters.page }),
        }),

    /** GET /admin/categories/{uuid} */
    get: (uuid: string) =>
        api.get<AdminCategoryObject>(`/admin/categories/${uuid}`),

    /** POST /admin/categories — multipart/form-data */
    create: (formData: FormData) =>
        api.postFormData<AdminCategoryObject>('/admin/categories', formData),

    /** PUT /admin/categories/{uuid} — multipart/form-data */
    update: (uuid: string, formData: FormData) =>
        api.putFormData<AdminCategoryObject>(`/admin/categories/${uuid}`, formData),

    /** PATCH /admin/categories/{uuid}/active */
    toggleActive: (uuid: string, active: boolean) =>
        api.patch<AdminCategoryObject>(`/admin/categories/${uuid}/active`, { active }),

    /** DELETE /admin/categories/{uuid} */
    delete: (uuid: string) =>
        api.delete<null>(`/admin/categories/${uuid}`),

    /** POST /admin/categories/{uuid}/restore */
    restore: (uuid: string) =>
        api.post<AdminCategoryObject>(`/admin/categories/${uuid}/restore`, {}),

    /** DELETE /admin/categories/{uuid}/force */
    forceDelete: (uuid: string) =>
        api.delete<null>(`/admin/categories/${uuid}/force`),
};

// ── Admin Subcategories API ─────────────────────────────

export interface AdminSubcategoryObject {
    uuid: string;
    name: AdminCategoryName;
    category_uuid: string;
    category?: { uuid: string; name: AdminCategoryName };
    image_url?: string | null;
    active: boolean;
    sort_order?: number;
    deleted_at?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface AdminSubcategoryListFilters {
    search?: string;
    active?: boolean;
    trashed?: 'only' | 'with';
    per_page?: number;
    page?: number;
}

export const adminSubcategoriesApi = {
    /** GET /admin/subcategories */
    list: (filters?: AdminSubcategoryListFilters) =>
        api.get<AdminSubcategoryObject[]>('/admin/subcategories', {
            ...(filters?.search   !== undefined && { search: filters.search }),
            ...(filters?.active   !== undefined && { active: String(filters.active) }),
            ...(filters?.trashed  !== undefined && { trashed: filters.trashed }),
            ...(filters?.per_page !== undefined && { per_page: filters.per_page }),
            ...(filters?.page     !== undefined && { page: filters.page }),
        }),

    /** GET /admin/subcategories/{uuid} */
    get: (uuid: string) =>
        api.get<AdminSubcategoryObject>(`/admin/subcategories/${uuid}`),

    /** POST /admin/subcategories — multipart/form-data */
    create: (formData: FormData) =>
        api.postFormData<AdminSubcategoryObject>('/admin/subcategories', formData),

    /** PUT /admin/subcategories/{uuid} — multipart/form-data */
    update: (uuid: string, formData: FormData) =>
        api.putFormData<AdminSubcategoryObject>(`/admin/subcategories/${uuid}`, formData),

    /** PATCH /admin/subcategories/{uuid}/active */
    toggleActive: (uuid: string, active: boolean) =>
        api.patch<AdminSubcategoryObject>(`/admin/subcategories/${uuid}/active`, { active }),

    /** DELETE /admin/subcategories/{uuid} */
    delete: (uuid: string) =>
        api.delete<null>(`/admin/subcategories/${uuid}`),

    /** POST /admin/subcategories/{uuid}/restore */
    restore: (uuid: string) =>
        api.post<AdminSubcategoryObject>(`/admin/subcategories/${uuid}/restore`, {}),

    /** DELETE /admin/subcategories/{uuid}/force */
    forceDelete: (uuid: string) =>
        api.delete<null>(`/admin/subcategories/${uuid}/force`),
};

// ── Admin Employees API ─────────────────────────────────

export interface EmployeeObject {
    uuid: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    active: boolean;
    blocked: boolean;
    provider_uuid?: string | null;
    provider?: { uuid: string; name: string } | null;
    branch_uuid?: string | null;
    branch?: { uuid: string; name: string } | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface EmployeeListFilters {
    provider_uuid?: string;
    branch_uuid?: string;
    active?: boolean;
    blocked?: boolean;
    search?: string;
    trashed?: 'only' | 'with';
    per_page?: number;
    page?: number;
}

export interface UpdateEmployeeStatusBody {
    active?: boolean;
    blocked?: boolean;
}

export const adminEmployeesApi = {
    /** GET /admin/employees */
    list: (filters?: EmployeeListFilters) =>
        api.get<EmployeeObject[]>('/admin/employees', {
            ...(filters?.provider_uuid !== undefined && { provider_uuid: filters.provider_uuid }),
            ...(filters?.branch_uuid   !== undefined && { branch_uuid: filters.branch_uuid }),
            ...(filters?.active        !== undefined && { active: String(filters.active) }),
            ...(filters?.blocked       !== undefined && { blocked: String(filters.blocked) }),
            ...(filters?.search        !== undefined && { search: filters.search }),
            ...(filters?.trashed       !== undefined && { trashed: filters.trashed }),
            ...(filters?.per_page      !== undefined && { per_page: filters.per_page }),
            ...(filters?.page          !== undefined && { page: filters.page }),
        }),

    /** GET /admin/employees/{uuid} */
    get: (uuid: string) =>
        api.get<EmployeeObject>(`/admin/employees/${uuid}`),

    /** PATCH /admin/employees/{uuid}/status */
    updateStatus: (uuid: string, body: UpdateEmployeeStatusBody) =>
        api.patch<EmployeeObject>(`/admin/employees/${uuid}/status`, body as unknown as Record<string, unknown>),

    /** DELETE /admin/employees/{uuid} */
    delete: (uuid: string) =>
        api.delete<null>(`/admin/employees/${uuid}`),

    /** POST /admin/employees/{uuid}/restore */
    restore: (uuid: string) =>
        api.post<EmployeeObject>(`/admin/employees/${uuid}/restore`, {}),
};

// ── Service Pricing ───────────────────────────────────────────────────────────

export interface ServicePriceObject {
    uuid: string;
    provider_uuid: string;
    provider?: { uuid: string; name: string } | null;
    service_uuid: string;
    service?: { uuid: string; name: string } | null;
    sub_category_uuid?: string | null;
    sub_category?: { uuid: string; name: string } | null;
    scope_type: 'branch' | 'employee' | string;
    branch_uuid?: string | null;
    branch?: { uuid: string; name: string } | null;
    employee_uuid?: string | null;
    employee?: { uuid: string; name: string } | null;
    pricing_group_uuid?: string | null;
    pricing_group?: { uuid: string; name: string } | null;
    price: number;
    active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface ServicePriceListFilters {
    provider_uuid?: string;
    service_uuid?: string;
    sub_category_uuid?: string;
    scope_type?: 'branch' | 'employee';
    branch_uuid?: string;
    employee_uuid?: string;
    pricing_group_uuid?: string;
    active?: boolean;
    trashed?: 'only' | 'with';
    per_page?: number;
    page?: number;
}

export const adminServicePricesApi = {
    /** GET /admin/service-prices */
    list: (filters?: ServicePriceListFilters) =>
        api.get<ServicePriceObject[]>('/admin/service-prices', {
            ...(filters?.provider_uuid       !== undefined && { provider_uuid: filters.provider_uuid }),
            ...(filters?.service_uuid        !== undefined && { service_uuid: filters.service_uuid }),
            ...(filters?.sub_category_uuid   !== undefined && { sub_category_uuid: filters.sub_category_uuid }),
            ...(filters?.scope_type          !== undefined && { scope_type: filters.scope_type }),
            ...(filters?.branch_uuid         !== undefined && { branch_uuid: filters.branch_uuid }),
            ...(filters?.employee_uuid       !== undefined && { employee_uuid: filters.employee_uuid }),
            ...(filters?.pricing_group_uuid  !== undefined && { pricing_group_uuid: filters.pricing_group_uuid }),
            ...(filters?.active              !== undefined && { active: String(filters.active) }),
            ...(filters?.trashed             !== undefined && { trashed: filters.trashed }),
            ...(filters?.per_page            !== undefined && { per_page: filters.per_page }),
            ...(filters?.page                !== undefined && { page: filters.page }),
        }),

    /** GET /admin/service-prices/{uuid} */
    get: (uuid: string) =>
        api.get<ServicePriceObject>(`/admin/service-prices/${uuid}`),
};

// ── Pricing Groups ────────────────────────────────────────────────────────────

export interface PricingGroupObject {
    uuid: string;
    name: string;
    provider_uuid: string;
    provider?: { uuid: string; name: string } | null;
    active: boolean;
    employees?: Array<{ uuid: string; name: string }>;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface PricingGroupListFilters {
    provider_uuid?: string;
    active?: boolean;
    trashed?: 'only' | 'with';
    per_page?: number;
    page?: number;
}

export const adminPricingGroupsApi = {
    /** GET /admin/pricing-groups */
    list: (filters?: PricingGroupListFilters) =>
        api.get<PricingGroupObject[]>('/admin/pricing-groups', {
            ...(filters?.provider_uuid !== undefined && { provider_uuid: filters.provider_uuid }),
            ...(filters?.active        !== undefined && { active: String(filters.active) }),
            ...(filters?.trashed       !== undefined && { trashed: filters.trashed }),
            ...(filters?.per_page      !== undefined && { per_page: filters.per_page }),
            ...(filters?.page          !== undefined && { page: filters.page }),
        }),

    /** GET /admin/pricing-groups/{uuid} */
    get: (uuid: string) =>
        api.get<PricingGroupObject>(`/admin/pricing-groups/${uuid}`),
};

// ── Admin Services ────────────────────────────────────────────────────────────

export interface AdminServiceObject {
    uuid: string;
    /** Providers offering this service; `active` + duration are per-provider. */
    providers?: Array<{
        uuid: string;
        name: string;
        active: boolean;
        estimated_duration_minutes?: number | null;
        deleted_at?: string | null;
    }>;
    sub_category_uuid?: string | null;
    sub_category_name?: string | null;
    category?: string | null;
    name: { ar?: string; en?: string } | string;
    description?: { ar?: string; en?: string } | string | null;
    image_url?: string | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface AdminServiceListFilters {
    provider_uuid?: string;
    sub_category_uuid?: string;
    active?: boolean;
    search?: string;
    trashed?: 'only' | 'with';
    per_page?: number;
    page?: number;
}

export interface UpdateServiceStatusBody {
    active?: boolean;
}

export const adminServicesApi = {
    /** GET /admin/services */
    list: (filters?: AdminServiceListFilters) =>
        api.get<AdminServiceObject[]>('/admin/services', {
            ...(filters?.provider_uuid     !== undefined && { provider_uuid: filters.provider_uuid }),
            ...(filters?.sub_category_uuid !== undefined && { sub_category_uuid: filters.sub_category_uuid }),
            ...(filters?.active            !== undefined && { active: String(filters.active) }),
            ...(filters?.search            !== undefined && { search: filters.search }),
            ...(filters?.trashed           !== undefined && { trashed: filters.trashed }),
            ...(filters?.per_page          !== undefined && { per_page: filters.per_page }),
            ...(filters?.page              !== undefined && { page: filters.page }),
        }),

    /** GET /admin/services/{uuid} */
    get: (uuid: string) =>
        api.get<AdminServiceObject>(`/admin/services/${uuid}`),

    /** PATCH /admin/services/{uuid}/status */
    updateStatus: (uuid: string, body: UpdateServiceStatusBody) =>
        api.patch<AdminServiceObject>(`/admin/services/${uuid}/status`, body as unknown as Record<string, unknown>),

    /** DELETE /admin/services/{uuid} */
    delete: (uuid: string) =>
        api.delete<null>(`/admin/services/${uuid}`),

    /** POST /admin/services/{uuid}/restore */
    restore: (uuid: string) =>
        api.post<AdminServiceObject>(`/admin/services/${uuid}/restore`, {}),
};

// ── Bookings ──────────────────────────────────────────────────────────────────

// Canonical 6-state booking lifecycle (incl. `in_progress`). Single source:
// re-exported from the shared contract so admin booking views can represent and
// filter an in-progress visit. See src/contract/waqty_contract.ts.
export type { BookingStatus } from '@/contract/waqty_contract';
import type { BookingStatus, PaymentStatus } from '@/contract/waqty_contract';

export interface BookingObject {
    uuid: string;
    status: BookingStatus;
    payment_status?: PaymentStatus | string | null;
    booking_date: string;
    start_time?: string | null;
    end_time?: string | null;
    price?: number | string | null;
    currency?: string | null;
    user_uuid?: string;
    user?: { uuid: string; name: string; phone?: string | null } | null;
    user_name?: string | null;
    user_phone?: string | null;
    provider_uuid?: string;
    provider?: { uuid: string; name: string } | null;
    branch_uuid?: string | null;
    branch?: { uuid: string; name: string } | null;
    employee_uuid?: string | null;
    employee?: { uuid: string; name: string } | null;
    // Snapshot objects returned by the live API (captured at booking time).
    service?: { uuid: string; name: { ar?: string; en?: string } | string; estimated_duration_minutes?: number | null } | null;
    service_snapshot?: { uuid: string; name: { ar?: string; en?: string } | string; estimated_duration_minutes?: number | null } | null;
    employee_snapshot?: { uuid: string; name: string; email?: string | null } | null;
    branch_snapshot?: { uuid: string; name: string } | null;
    provider_snapshot?: { uuid: string; name: string } | null;
    rating?: number | null;
    notes?: string | null;
    total_price?: number | null;
    created_at: string;
    updated_at?: string;
    deleted_at?: string | null;
}

export interface BookingListFilters {
    status?: BookingStatus;
    user_uuid?: string;
    provider_uuid?: string;
    branch_uuid?: string;
    employee_uuid?: string;
    booking_date?: string;
    from_date?: string;
    to_date?: string;
    trashed?: 'only' | 'with';
    per_page?: number;
    page?: number;
}

export const adminBookingsApi = {
    /** GET /admin/bookings */
    list: (filters?: BookingListFilters) =>
        api.get<BookingObject[]>('/admin/bookings', {
            ...(filters?.status        !== undefined && { status: filters.status }),
            ...(filters?.user_uuid     !== undefined && { user_uuid: filters.user_uuid }),
            ...(filters?.provider_uuid !== undefined && { provider_uuid: filters.provider_uuid }),
            ...(filters?.branch_uuid   !== undefined && { branch_uuid: filters.branch_uuid }),
            ...(filters?.employee_uuid !== undefined && { employee_uuid: filters.employee_uuid }),
            ...(filters?.booking_date  !== undefined && { booking_date: filters.booking_date }),
            ...(filters?.from_date     !== undefined && { from_date: filters.from_date }),
            ...(filters?.to_date       !== undefined && { to_date: filters.to_date }),
            ...(filters?.trashed       !== undefined && { trashed: filters.trashed }),
            ...(filters?.per_page      !== undefined && { per_page: filters.per_page }),
            ...(filters?.page          !== undefined && { page: filters.page }),
        }),

    /** GET /admin/bookings/next-upcoming */
    nextUpcoming: () =>
        api.get<BookingObject | null>('/admin/bookings/next-upcoming'),

    /** GET /admin/bookings/{uuid} */
    get: (uuid: string) =>
        api.get<BookingObject>(`/admin/bookings/${uuid}`),

    /** PATCH /admin/bookings/{uuid}/status */
    updateStatus: (uuid: string, status: BookingStatus) =>
        api.patch<BookingObject>(`/admin/bookings/${uuid}/status`, { status } as unknown as Record<string, unknown>),

    /** DELETE /admin/bookings/{uuid} */
    delete: (uuid: string) =>
        api.delete<null>(`/admin/bookings/${uuid}`),
};

// ── Users ─────────────────────────────────────────────────────────────────────

export interface UserObject {
    uuid: string;
    name: string;
    email: string;
    phone: string;
    gender: 'male' | 'female' | string;
    date_birth?: string | null;
    active: boolean;
    blocked: boolean;
    banned: boolean;
    email_verified_at?: string | null;
    avatar_url?: string | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface UserListFilters {
    search?: string;
    active?: boolean;
    blocked?: boolean;
    banned?: boolean;
    gender?: 'male' | 'female';
    trashed?: 'only' | 'with';
    per_page?: number;
    page?: number;
}

export const adminUsersApi = {
    /** GET /admin/users */
    list: (filters?: UserListFilters) =>
        api.get<UserObject[]>('/admin/users', {
            ...(filters?.search   !== undefined && { search: filters.search }),
            ...(filters?.active   !== undefined && { active: String(filters.active) }),
            ...(filters?.blocked  !== undefined && { blocked: String(filters.blocked) }),
            ...(filters?.banned   !== undefined && { banned: String(filters.banned) }),
            ...(filters?.gender   !== undefined && { gender: filters.gender }),
            ...(filters?.trashed  !== undefined && { trashed: filters.trashed }),
            ...(filters?.per_page !== undefined && { per_page: filters.per_page }),
            ...(filters?.page     !== undefined && { page: filters.page }),
        }),

    /** GET /admin/users/{uuid} */
    get: (uuid: string) =>
        api.get<UserObject>(`/admin/users/${uuid}`),

    /** PATCH /admin/users/{uuid}/active */
    toggleActive: (uuid: string, active: boolean) =>
        api.patch<UserObject>(`/admin/users/${uuid}/active`, { active } as unknown as Record<string, unknown>),

    /** PATCH /admin/users/{uuid}/block */
    toggleBlock: (uuid: string, blocked: boolean) =>
        api.patch<UserObject>(`/admin/users/${uuid}/block`, { blocked } as unknown as Record<string, unknown>),

    /** PATCH /admin/users/{uuid}/ban */
    toggleBan: (uuid: string, banned: boolean) =>
        api.patch<UserObject>(`/admin/users/${uuid}/ban`, { banned } as unknown as Record<string, unknown>),

    /** DELETE /admin/users/{uuid} */
    delete: (uuid: string) =>
        api.delete<null>(`/admin/users/${uuid}`),

    /** POST /admin/users/{uuid}/restore */
    restore: (uuid: string) =>
        api.post<UserObject>(`/admin/users/${uuid}/restore`, {}),
};

// ── Ratings ───────────────────────────────────────────────────────────────────

export interface RatingStatsObject {
    total: number;
    published: number;
    hidden: number;
    avg_rating: number;
}

export interface RatingObject {
    uuid: string;
    rating: number;
    comment?: string | null;
    active: boolean;
    user?: {
        uuid: string;
        name: string;
        email?: string | null;
        phone?: string | null;
    } | null;
    booking?: {
        uuid: string;
        booking_date: string;
        provider?: { uuid: string; name: string } | null;
        branch?: { uuid: string; name: string } | null;
    } | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface RatingListFilters {
    search?: string;
    active?: boolean;
    rating?: 1 | 2 | 3 | 4 | 5;
    provider_uuid?: string;
    trashed?: 'only' | 'with';
    per_page?: number;
    page?: number;
}

export interface RatingAnalyticsSummary {
    total: number;
    avg_rating: number;
    published: number;
    hidden: number;
    response_rate: number;
}

export interface RatingDistributionItem {
    stars: number;
    count: number;
}

export interface RatingByProviderItem {
    provider_uuid: string;
    provider_name: string;
    total: number;
    avg_rating: number;
}

export interface RatingAnalyticsObject {
    summary: RatingAnalyticsSummary;
    rating_distribution: RatingDistributionItem[];
    by_provider: RatingByProviderItem[];
}

export const adminRatingsApi = {
    /** GET /admin/ratings/analytics */
    analytics: () =>
        api.get<RatingAnalyticsObject>('/admin/ratings/analytics'),

    /** GET /admin/ratings/stats */
    stats: () =>
        api.get<RatingStatsObject>('/admin/ratings/stats'),

    /** GET /admin/ratings */
    list: (filters?: RatingListFilters) =>
        api.get<RatingObject[]>('/admin/ratings', {
            ...(filters?.search        !== undefined && { search: filters.search }),
            ...(filters?.active        !== undefined && { active: String(filters.active) }),
            ...(filters?.rating        !== undefined && { rating: filters.rating }),
            ...(filters?.provider_uuid !== undefined && { provider_uuid: filters.provider_uuid }),
            ...(filters?.trashed       !== undefined && { trashed: filters.trashed }),
            ...(filters?.per_page      !== undefined && { per_page: filters.per_page }),
            ...(filters?.page          !== undefined && { page: filters.page }),
        }),

    /** GET /admin/ratings/{uuid} */
    get: (uuid: string) =>
        api.get<RatingObject>(`/admin/ratings/${uuid}`),

    /** PATCH /admin/ratings/{uuid}/active */
    toggleActive: (uuid: string, active: boolean) =>
        api.patch<RatingObject>(`/admin/ratings/${uuid}/active`, { active } as unknown as Record<string, unknown>),

    /** DELETE /admin/ratings/{uuid} */
    delete: (uuid: string) =>
        api.delete<null>(`/admin/ratings/${uuid}`),
};

// ── Content Pages ─────────────────────────────────────────────────────────────
export interface ContentPageObject {
    uuid: string;
    slug: string;
    title_en: string;
    title_ar: string;
    content_en: string | null;
    content_ar: string | null;
    active: boolean;
    updated_by?: { uuid: string; name: string };
    created_at: string;
    updated_at: string;
}

export interface ContentPagePayload {
    slug?: string;
    title_en?: string;
    title_ar?: string;
    content_en?: string;
    content_ar?: string;
    active?: boolean;
}

// ── Promo Codes ───────────────────────────────────────────────────────────────
export type PromoCodeType = 'percentage' | 'fixed';

export interface PromoCodeObject {
    uuid: string;
    code: string;
    type: PromoCodeType;
    value: number;
    min_order: number | null;
    max_discount: number | null;
    usage_limit: number | null;
    usage_count: number;
    valid_until: string;
    active: boolean;
    is_expired: boolean;
    is_exhausted: boolean;
    created_by?: { uuid: string; name: string };
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface PromoCodePayload {
    code?: string;
    type?: PromoCodeType;
    value?: number;
    min_order?: number | null;
    max_discount?: number | null;
    usage_limit?: number | null;
    valid_until?: string;
    active?: boolean;
}

export interface PromoCodeListFilters {
    search?: string;
    active?: boolean;
    type?: PromoCodeType;
    expired?: boolean;
    trashed?: 'only';
    per_page?: number;
    page?: number;
}

export const adminPromoCodesApi = {
    /** GET /admin/promo-codes */
    list: (filters?: PromoCodeListFilters) =>
        api.get<PromoCodeObject[]>('/admin/promo-codes', {
            ...(filters?.search  !== undefined && { search: filters.search }),
            ...(filters?.active  !== undefined && { active: String(filters.active) }),
            ...(filters?.type    !== undefined && { type: filters.type }),
            ...(filters?.expired !== undefined && { expired: String(filters.expired) }),
            ...(filters?.trashed !== undefined && { trashed: filters.trashed }),
            ...(filters?.per_page !== undefined && { per_page: filters.per_page }),
            ...(filters?.page    !== undefined && { page: filters.page }),
        }),

    /** GET /admin/promo-codes/{uuid} */
    get: (uuid: string) =>
        api.get<PromoCodeObject>(`/admin/promo-codes/${uuid}`),

    /** POST /admin/promo-codes */
    create: (payload: PromoCodePayload & { code: string; value: number; valid_until: string }) =>
        api.post<PromoCodeObject>('/admin/promo-codes', payload as unknown as Record<string, unknown>),

    /** PUT /admin/promo-codes/{uuid} */
    update: (uuid: string, payload: PromoCodePayload) =>
        api.put<PromoCodeObject>(`/admin/promo-codes/${uuid}`, payload as unknown as Record<string, unknown>),

    /** PATCH /admin/promo-codes/{uuid}/active */
    toggleActive: (uuid: string, active: boolean) =>
        api.patch<PromoCodeObject>(`/admin/promo-codes/${uuid}/active`, { active } as unknown as Record<string, unknown>),

    /** DELETE /admin/promo-codes/{uuid} */
    delete: (uuid: string) =>
        api.delete<null>(`/admin/promo-codes/${uuid}`),
};

// ── Banners ───────────────────────────────────────────────────────────────────
export type BannerPlacement  = 'home_top' | 'home_bottom' | 'home_middle' | 'category' | 'sidebar';
export type BannerDimensions = '1200x400' | '1200x600' | '800x400' | '600x300';

export interface BannerObject {
    uuid: string;
    title: string;
    image_url: string | null;
    placement: BannerPlacement;
    dimensions: string;
    active: boolean;
    sort_order: number;
    starts_at: string | null;
    ends_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface BannerListFilters {
    search?: string;
    active?: boolean;
    placement?: BannerPlacement;
    trashed?: 'only';
    per_page?: number;
    page?: number;
}

export const adminBannersApi = {
    /** GET /admin/banners */
    list: (filters?: BannerListFilters) =>
        api.get<BannerObject[]>('/admin/banners', {
            ...(filters?.search    !== undefined && { search: filters.search }),
            ...(filters?.active    !== undefined && { active: String(filters.active) }),
            ...(filters?.placement !== undefined && { placement: filters.placement }),
            ...(filters?.trashed   !== undefined && { trashed: filters.trashed }),
            ...(filters?.per_page  !== undefined && { per_page: filters.per_page }),
            ...(filters?.page      !== undefined && { page: filters.page }),
        }),

    /** GET /admin/banners/{uuid} */
    get: (uuid: string) =>
        api.get<BannerObject>(`/admin/banners/${uuid}`),

    /** POST /admin/banners — multipart/form-data */
    create: (formData: FormData) =>
        api.postFormData<BannerObject>('/admin/banners', formData),

    /** PUT /admin/banners/{uuid} — multipart/form-data */
    update: (uuid: string, formData: FormData) =>
        api.putFormData<BannerObject>(`/admin/banners/${uuid}`, formData),

    /** PATCH /admin/banners/{uuid}/active */
    toggleActive: (uuid: string, active: boolean) =>
        api.patch<BannerObject>(`/admin/banners/${uuid}/active`, { active } as unknown as Record<string, unknown>),

    /** DELETE /admin/banners/{uuid} */
    delete: (uuid: string) =>
        api.delete<null>(`/admin/banners/${uuid}`),
};

// ── Announcements ─────────────────────────────────────────────────────────────
export type AnnouncementTarget   = 'all' | 'users' | 'providers' | 'employees' | 'branches';
export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface AnnouncementObject {
    uuid: string;
    title_en: string;
    title_ar: string;
    message_en: string;
    message_ar: string;
    target: AnnouncementTarget;
    priority: AnnouncementPriority;
    active: boolean;
    ends_at: string | null;
    created_by?: { uuid: string; name: string };
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface AnnouncementPayload {
    title_en?: string;
    title_ar?: string;
    message_en?: string;
    message_ar?: string;
    target?: AnnouncementTarget;
    priority?: AnnouncementPriority;
    active?: boolean;
    ends_at?: string | null;
}

export interface AnnouncementListFilters {
    search?: string;
    active?: boolean;
    target?: AnnouncementTarget;
    priority?: AnnouncementPriority;
    trashed?: 'only';
    per_page?: number;
    page?: number;
}

export const adminAnnouncementsApi = {
    /** GET /admin/announcements */
    list: (filters?: AnnouncementListFilters) =>
        api.get<AnnouncementObject[]>('/admin/announcements', {
            ...(filters?.search    !== undefined && { search: filters.search }),
            ...(filters?.active    !== undefined && { active: String(filters.active) }),
            ...(filters?.target    !== undefined && { target: filters.target }),
            ...(filters?.priority  !== undefined && { priority: filters.priority }),
            ...(filters?.trashed   !== undefined && { trashed: filters.trashed }),
            ...(filters?.per_page  !== undefined && { per_page: filters.per_page }),
            ...(filters?.page      !== undefined && { page: filters.page }),
        }),

    /** GET /admin/announcements/{uuid} */
    get: (uuid: string) =>
        api.get<AnnouncementObject>(`/admin/announcements/${uuid}`),

    /** POST /admin/announcements */
    create: (payload: AnnouncementPayload & { title_en: string; title_ar: string; message_en: string; message_ar: string }) =>
        api.post<AnnouncementObject>('/admin/announcements', payload as unknown as Record<string, unknown>),

    /** PUT /admin/announcements/{uuid} */
    update: (uuid: string, payload: AnnouncementPayload) =>
        api.put<AnnouncementObject>(`/admin/announcements/${uuid}`, payload as unknown as Record<string, unknown>),

    /** PATCH /admin/announcements/{uuid}/active */
    toggleActive: (uuid: string, active: boolean) =>
        api.patch<AnnouncementObject>(`/admin/announcements/${uuid}/active`, { active } as unknown as Record<string, unknown>),

    /** DELETE /admin/announcements/{uuid} */
    delete: (uuid: string) =>
        api.delete<null>(`/admin/announcements/${uuid}`),
};

export const adminPagesApi = {
    /** GET /admin/pages */
    list: () =>
        api.get<ContentPageObject[]>('/admin/pages'),

    /** GET /admin/pages/{uuid} */
    get: (uuid: string) =>
        api.get<ContentPageObject>(`/admin/pages/${uuid}`),

    /** POST /admin/pages */
    create: (payload: ContentPagePayload & { slug: string; title_en: string; title_ar: string }) =>
        api.post<ContentPageObject>('/admin/pages', payload as unknown as Record<string, unknown>),

    /** PUT /admin/pages/{uuid} */
    update: (uuid: string, payload: ContentPagePayload) =>
        api.put<ContentPageObject>(`/admin/pages/${uuid}`, payload as unknown as Record<string, unknown>),

    /** PATCH /admin/pages/{uuid}/active */
    toggleActive: (uuid: string, active: boolean) =>
        api.patch<ContentPageObject>(`/admin/pages/${uuid}/active`, { active } as unknown as Record<string, unknown>),
};

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
    status: BookingStatus; // canonical 6-state union (incl. in_progress)
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
    updateBookingStatus: (uuid: string, status: BookingStatus) =>
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
    updateBookingStatus: (uuid: string, status: BookingStatus) =>
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
    booking_status_distribution: Array<{ status: BookingStatus; count: number }>;
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
