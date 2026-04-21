export type NotificationCategory = 'provider' | 'subscription' | 'review' | 'support' | 'system' | 'finance';

export interface AdminNotification {
    id: string;
    category: NotificationCategory;
    title: string;
    title_ar: string;
    description: string;
    description_ar: string;
    created_at: string;
    read: boolean;
    href?: string;
}

const now = Date.now();
const minutes = (n: number) => new Date(now - n * 60_000).toISOString();
const hours = (n: number) => new Date(now - n * 3_600_000).toISOString();
const days = (n: number) => new Date(now - n * 86_400_000).toISOString();

export const mockNotifications: AdminNotification[] = [
    {
        id: 'n1',
        category: 'provider',
        title: 'New provider registration',
        title_ar: 'تسجيل مقدم خدمة جديد',
        description: 'Zen Barber Lounge submitted a verification packet.',
        description_ar: 'قدم صالون زن باربر حزمة التحقق.',
        created_at: minutes(4),
        read: false,
        href: '/providers/registrations',
    },
    {
        id: 'n2',
        category: 'subscription',
        title: 'Past-due subscription',
        title_ar: 'اشتراك متأخر الدفع',
        description: 'Elite Barbers is 3 days past due on the Pro plan.',
        description_ar: 'صالون إيليت باربرز متأخر 3 أيام عن سداد باقة برو.',
        created_at: minutes(22),
        read: false,
        href: '/subscriptions',
    },
    {
        id: 'n3',
        category: 'review',
        title: 'Review flagged',
        title_ar: 'تم وضع علامة على تقييم',
        description: 'A 1-star review on Glow Skin Clinic was reported twice.',
        description_ar: 'تم الإبلاغ عن تقييم بنجمة واحدة على عيادة جلو سكين مرتين.',
        created_at: hours(1),
        read: false,
        href: '/reviews',
    },
    {
        id: 'n4',
        category: 'support',
        title: 'SLA breach risk',
        title_ar: 'خطر تجاوز اتفاقية الخدمة',
        description: 'Ticket TK-006 is 30 minutes from SLA deadline.',
        description_ar: 'تذكرة TK-006 على بُعد 30 دقيقة من الموعد النهائي.',
        created_at: hours(2),
        read: true,
        href: '/support',
    },
    {
        id: 'n5',
        category: 'finance',
        title: 'Payout batch completed',
        title_ar: 'اكتمال دفعة المدفوعات',
        description: 'March payout batch processed — 47 providers paid EGP 1.4M.',
        description_ar: 'تمت معالجة دفعة مدفوعات مارس — دفع 47 مقدم خدمة مبلغ 1.4 مليون جنيه.',
        created_at: hours(6),
        read: true,
        href: '/finance/payouts',
    },
    {
        id: 'n6',
        category: 'system',
        title: 'Nightly backup succeeded',
        title_ar: 'نجح النسخ الاحتياطي الليلي',
        description: 'Database snapshot uploaded to cold storage.',
        description_ar: 'تم رفع لقطة قاعدة البيانات إلى التخزين البارد.',
        created_at: days(1),
        read: true,
        href: '/system-health',
    },
];
