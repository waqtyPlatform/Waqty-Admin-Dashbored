export interface ContentPage {
    id: string;
    slug: string;
    title: string;
    title_ar: string;
    content: string;
    content_ar: string;
    type: 'terms' | 'privacy' | 'faq' | 'about' | 'custom';
    published: boolean;
    last_updated_by: string;
    created_at: string;
    updated_at: string;
}

export interface EmailTemplate {
    id: string;
    name: string;
    slug: string;
    subject: string;
    subject_ar: string;
    body_html: string;
    body_html_ar: string;
    variables: string[];
    type: 'email' | 'sms';
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ServiceCategory {
    id: string;
    name: string;
    name_ar: string;
    icon?: string;
    parent_id: string | null;
    order: number;
    active: boolean;
    subcategories_count: number;
    services_count: number;
}
