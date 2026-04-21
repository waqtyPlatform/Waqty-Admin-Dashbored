import { z } from 'zod';

export const emailSchema = z.string().min(1, 'Email is required').email('Invalid email address');

export const egyptPhoneSchema = z
    .string()
    .min(1, 'Phone is required')
    .regex(/^(\+20|020|0)?1[0125]\d{8}$/, 'Invalid Egyptian phone number');

export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain a special character');

export const requiredString = (label: string, min = 1) =>
    z.string().min(min, `${label} is required`);

export const optionalUrl = z.string().url('Invalid URL').optional().or(z.literal(''));

export const percentSchema = z
    .number({ error: 'Must be a number' })
    .min(1, 'Must be at least 1%')
    .max(100, 'Must be at most 100%');

export const commissionRateSchema = z
    .number({ error: 'Must be a number' })
    .min(0, 'Cannot be negative')
    .max(50, 'Maximum commission is 50%');

export const positiveMoneySchema = z
    .number({ error: 'Must be a number' })
    .nonnegative('Must be zero or positive');

export const positiveIntSchema = z
    .number({ error: 'Must be a number' })
    .int('Must be a whole number')
    .positive('Must be greater than zero');

export const providerCreateSchema = z.object({
    business_name: requiredString('Business name', 2),
    name: requiredString('Owner name', 2),
    email: emailSchema,
    phone: egyptPhoneSchema,
    business_category: requiredString('Category'),
    country: requiredString('Country'),
    city: requiredString('City'),
    commission_rate: commissionRateSchema.default(15),
});
export type ProviderCreateInput = z.infer<typeof providerCreateSchema>;

export const userCreateSchema = z.object({
    name: requiredString('Name', 2),
    email: emailSchema,
    phone: egyptPhoneSchema,
    city: requiredString('City'),
    country: z.string().default('Egypt'),
    gender: z.enum(['male', 'female']).optional(),
    date_of_birth: z.string().optional(),
    preferred_language: z.enum(['en', 'ar']).default('en'),
});
export type UserCreateInput = z.infer<typeof userCreateSchema>;

export const adminCreateSchema = z.object({
    name: requiredString('Name', 2),
    email: emailSchema,
    role: z.enum(['super_admin', 'admin', 'moderator', 'support', 'finance', 'viewer']),
    password: passwordSchema,
});
export type AdminCreateInput = z.infer<typeof adminCreateSchema>;

export const planCreateSchema = z.object({
    name: requiredString('Plan name', 2),
    name_ar: requiredString('Arabic name', 2),
    tier: z.enum(['basic', 'pro', 'enterprise']),
    price_monthly: positiveMoneySchema,
    price_yearly: positiveMoneySchema,
    trial_days: z.number().int().min(0).max(90).default(14),
});
export type PlanCreateInput = z.infer<typeof planCreateSchema>;

export const promoCodeSchema = z
    .object({
        code: requiredString('Code', 3).regex(/^[A-Z0-9_-]+$/i, 'Letters, numbers, dash, underscore only'),
        discount_type: z.enum(['percentage', 'fixed']),
        discount_value: z.number().positive('Must be greater than zero'),
        max_uses: z.number().int().positive().optional(),
        expires_at: z.string().optional(),
    })
    .refine(
        v => v.discount_type !== 'percentage' || (v.discount_value >= 1 && v.discount_value <= 100),
        { message: 'Percentage must be between 1 and 100', path: ['discount_value'] }
    );
export type PromoCodeInput = z.infer<typeof promoCodeSchema>;

export const adCreateSchema = z.object({
    title: requiredString('Title', 2),
    description: requiredString('Description', 5),
    ad_type: requiredString('Ad type'),
    placement: requiredString('Placement'),
    start_date: requiredString('Start date'),
    end_date: requiredString('End date'),
    budget: positiveMoneySchema,
}).refine(v => new Date(v.end_date) >= new Date(v.start_date), {
    message: 'End date must be after start date',
    path: ['end_date'],
});
export type AdCreateInput = z.infer<typeof adCreateSchema>;

export const announcementSchema = z.object({
    title: requiredString('Title', 2),
    body: requiredString('Body', 10),
    target: z.enum(['all', 'providers', 'users', 'admins']),
    scheduled_at: z.string().optional(),
});
export type AnnouncementInput = z.infer<typeof announcementSchema>;

export const countryCreateSchema = z.object({
    name: requiredString('Country name', 2),
    code: z.string().length(2, 'ISO code must be 2 letters').toUpperCase(),
    currency: z.string().length(3, 'Currency code must be 3 letters').toUpperCase(),
    phone_code: requiredString('Phone code'),
    active: z.boolean().default(true),
});
export type CountryCreateInput = z.infer<typeof countryCreateSchema>;

export const walletAdjustSchema = (maxDeduct?: number) =>
    z.object({
        amount: z.number().positive('Amount must be greater than zero').refine(
            v => maxDeduct === undefined || v <= maxDeduct,
            { message: `Amount cannot exceed ${maxDeduct}` }
        ),
        reason: requiredString('Reason', 3),
    });

export const refundSchema = (maxAmount: number) =>
    z.object({
        type: z.enum(['partial', 'full']),
        amount: z.number().positive().max(maxAmount, `Max ${maxAmount}`),
        destination: z.enum(['wallet', 'original']),
        reason: requiredString('Reason', 3),
    });
