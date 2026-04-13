export interface AppVersion {
    id: string;
    app: 'user_ios' | 'user_android' | 'employee_ios' | 'employee_android';
    version: string;
    build_number: number;
    min_required_version: string;
    force_update: boolean;
    release_notes: string;
    release_notes_ar: string;
    released_at: string;
    created_at: string;
}

export interface SystemHealthMetric {
    service: string;
    status: 'healthy' | 'degraded' | 'down';
    uptime_percent: number;
    avg_response_ms: number;
    error_rate: number;
    last_checked_at: string;
}

export interface AuditLog {
    id: string;
    admin_id: string;
    admin_name: string;
    admin_role: string;
    action: string;
    entity_type: string;
    entity_id: string | null;
    details: Record<string, unknown>;
    ip_address: string;
    user_agent: string;
    created_at: string;
}
