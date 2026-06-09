// App-owned demo seed data (formerly generated from the retired shared
// contract's fixtures.demo.json). Edit freely.
import type { Provider, Branch, Employee, ServiceCategory, Service, ServicePrice, Customer, Visit } from '@/contract/waqty_contract';

export const demoProviders: Provider[] = [
  {
    "uuid": "prov-001",
    "name": "Glamour Studio",
    "name_ar": "جلامور ستوديو",
    "business_category": "salon",
    "email": "hello@glamourstudio.eg",
    "phone": "+201000000001",
    "status": "active",
    "country": "EG",
    "city": "Cairo",
    "commission_rate": 0.1,
    "subscription_plan_uuid": "plan-3",
    "subscription_status": "active",
    "branches_count": 1,
    "employees_count": 2,
    "created_at": "2024-06-15T10:00:00Z",
    "updated_at": "2026-05-01T10:00:00Z"
  },
  {
    "uuid": "prov-002",
    "name": "Elite Barbers",
    "name_ar": "إيليت باربرز",
    "business_category": "barber",
    "email": "hello@elitebarbers.eg",
    "phone": "+201000000002",
    "status": "active",
    "country": "EG",
    "city": "Giza",
    "commission_rate": 0.1,
    "subscription_plan_uuid": "plan-2",
    "subscription_status": "active",
    "branches_count": 1,
    "employees_count": 1,
    "created_at": "2024-08-20T10:00:00Z",
    "updated_at": "2026-05-01T10:00:00Z"
  },
  {
    "uuid": "prov-003",
    "name": "Royal Spa & Wellness",
    "name_ar": "رويال سبا",
    "business_category": "spa",
    "email": "hello@royalspa.eg",
    "phone": "+201000000003",
    "status": "active",
    "country": "EG",
    "city": "Cairo",
    "commission_rate": 0.08,
    "subscription_plan_uuid": "plan-2",
    "subscription_status": "active",
    "branches_count": 1,
    "employees_count": 1,
    "created_at": "2024-01-10T10:00:00Z",
    "updated_at": "2026-05-01T10:00:00Z"
  },
  {
    "uuid": "prov-004",
    "name": "Nail Art Studio",
    "name_ar": "ستوديو فن الأظافر",
    "business_category": "nails",
    "email": "hello@nailart.eg",
    "phone": "+201000000004",
    "status": "active",
    "country": "EG",
    "city": "Alexandria",
    "commission_rate": 0.1,
    "subscription_plan_uuid": "plan-1",
    "subscription_status": "trial",
    "branches_count": 1,
    "employees_count": 1,
    "created_at": "2025-03-25T10:00:00Z",
    "updated_at": "2026-05-01T10:00:00Z"
  }
];

export const demoBranches: Branch[] = [
  {
    "uuid": "branch-001",
    "provider_uuid": "prov-001",
    "name": "Glamour Studio — Zamalek",
    "name_ar": "جلامور — الزمالك",
    "phone": "+201000000011",
    "country": "EG",
    "city": "Cairo",
    "address": "12 Brazil St, Zamalek",
    "lat": 30.061,
    "lng": 31.2197,
    "is_main": true,
    "active": true,
    "created_at": "2024-06-15T10:00:00Z",
    "updated_at": "2026-05-01T10:00:00Z"
  },
  {
    "uuid": "branch-002",
    "provider_uuid": "prov-002",
    "name": "Elite Barbers — Dokki",
    "name_ar": "إيليت — الدقي",
    "phone": "+201000000012",
    "country": "EG",
    "city": "Giza",
    "address": "5 Tahrir St, Dokki",
    "lat": 30.0385,
    "lng": 31.2118,
    "is_main": true,
    "active": true,
    "created_at": "2024-08-20T10:00:00Z",
    "updated_at": "2026-05-01T10:00:00Z"
  },
  {
    "uuid": "branch-003",
    "provider_uuid": "prov-003",
    "name": "Royal Spa — Maadi",
    "name_ar": "رويال — المعادي",
    "phone": "+201000000013",
    "country": "EG",
    "city": "Cairo",
    "address": "20 Road 9, Maadi",
    "lat": 29.9602,
    "lng": 31.2569,
    "is_main": true,
    "active": true,
    "created_at": "2024-02-10T10:00:00Z",
    "updated_at": "2026-05-01T10:00:00Z"
  },
  {
    "uuid": "branch-004",
    "provider_uuid": "prov-004",
    "name": "Nail Art — Smouha",
    "name_ar": "فن الأظافر — سموحة",
    "phone": "+201000000014",
    "country": "EG",
    "city": "Alexandria",
    "address": "8 Victor Emanuel Sq, Smouha",
    "lat": 31.2156,
    "lng": 29.9553,
    "is_main": true,
    "active": true,
    "created_at": "2025-03-25T10:00:00Z",
    "updated_at": "2026-05-01T10:00:00Z"
  }
];

export const demoEmployees: Employee[] = [
  {
    "uuid": "emp-001",
    "provider_uuid": "prov-001",
    "branch_uuid": "branch-001",
    "employee_number": "E-001",
    "name": "Sarah Al-Hashimi",
    "name_ar": "سارة الهاشمي",
    "role": "Senior Stylist",
    "rating": 4.9,
    "reviews_count": 142,
    "active": true,
    "blocked": false,
    "created_at": "2024-06-15T10:00:00Z",
    "updated_at": "2026-05-01T10:00:00Z"
  },
  {
    "uuid": "emp-002",
    "provider_uuid": "prov-001",
    "branch_uuid": "branch-001",
    "employee_number": "E-002",
    "name": "Mona Adel",
    "name_ar": "منى عادل",
    "role": "Colorist",
    "rating": 4.7,
    "reviews_count": 88,
    "active": true,
    "blocked": false,
    "created_at": "2024-07-01T10:00:00Z",
    "updated_at": "2026-05-01T10:00:00Z"
  },
  {
    "uuid": "emp-003",
    "provider_uuid": "prov-002",
    "branch_uuid": "branch-002",
    "employee_number": "E-003",
    "name": "Karim Fouad",
    "name_ar": "كريم فؤاد",
    "role": "Master Barber",
    "rating": 4.8,
    "reviews_count": 120,
    "active": true,
    "blocked": false,
    "created_at": "2024-08-20T10:00:00Z",
    "updated_at": "2026-05-01T10:00:00Z"
  },
  {
    "uuid": "emp-004",
    "provider_uuid": "prov-003",
    "branch_uuid": "branch-003",
    "employee_number": "E-004",
    "name": "Layla Hassan",
    "name_ar": "ليلى حسن",
    "role": "Therapist",
    "rating": 4.9,
    "reviews_count": 64,
    "active": true,
    "blocked": false,
    "created_at": "2024-02-10T10:00:00Z",
    "updated_at": "2026-05-01T10:00:00Z"
  }
];

export const demoServiceCategories: ServiceCategory[] = [
  {
    "uuid": "cat-hair",
    "provider_uuid": null,
    "parent_uuid": null,
    "name": "Hair",
    "name_ar": "الشعر",
    "active": true
  },
  {
    "uuid": "cat-beard",
    "provider_uuid": null,
    "parent_uuid": null,
    "name": "Beard & Grooming",
    "name_ar": "اللحية والعناية",
    "active": true
  },
  {
    "uuid": "cat-spa",
    "provider_uuid": null,
    "parent_uuid": null,
    "name": "Spa & Massage",
    "name_ar": "سبا ومساج",
    "active": true
  },
  {
    "uuid": "cat-nails",
    "provider_uuid": null,
    "parent_uuid": null,
    "name": "Nails",
    "name_ar": "الأظافر",
    "active": true
  }
];

export const demoServices: Service[] = [
  {
    "uuid": "svc-001",
    "provider_uuid": "prov-001",
    "sub_category_uuid": "cat-hair",
    "name": "Haircut & Styling",
    "name_ar": "قص وتصفيف الشعر",
    "estimated_duration_minutes": 60,
    "active": true,
    "created_at": "2024-06-15T10:00:00Z",
    "updated_at": "2026-05-01T10:00:00Z"
  },
  {
    "uuid": "svc-002",
    "provider_uuid": "prov-001",
    "sub_category_uuid": "cat-hair",
    "name": "Hair Coloring",
    "name_ar": "صبغة الشعر",
    "estimated_duration_minutes": 120,
    "active": true,
    "created_at": "2024-06-15T10:00:00Z",
    "updated_at": "2026-05-01T10:00:00Z"
  },
  {
    "uuid": "svc-003",
    "provider_uuid": "prov-002",
    "sub_category_uuid": "cat-beard",
    "name": "Beard Trim",
    "name_ar": "تهذيب اللحية",
    "estimated_duration_minutes": 30,
    "active": true,
    "created_at": "2024-08-20T10:00:00Z",
    "updated_at": "2026-05-01T10:00:00Z"
  },
  {
    "uuid": "svc-004",
    "provider_uuid": "prov-002",
    "sub_category_uuid": "cat-hair",
    "name": "Classic Cut",
    "name_ar": "قصة كلاسيك",
    "estimated_duration_minutes": 45,
    "active": true,
    "created_at": "2024-08-20T10:00:00Z",
    "updated_at": "2026-05-01T10:00:00Z"
  },
  {
    "uuid": "svc-005",
    "provider_uuid": "prov-003",
    "sub_category_uuid": "cat-spa",
    "name": "Swedish Massage",
    "name_ar": "مساج سويدي",
    "estimated_duration_minutes": 90,
    "active": true,
    "created_at": "2024-02-10T10:00:00Z",
    "updated_at": "2026-05-01T10:00:00Z"
  },
  {
    "uuid": "svc-006",
    "provider_uuid": "prov-004",
    "sub_category_uuid": "cat-nails",
    "name": "Gel Manicure",
    "name_ar": "مانيكير جل",
    "estimated_duration_minutes": 60,
    "active": true,
    "created_at": "2025-03-25T10:00:00Z",
    "updated_at": "2026-05-01T10:00:00Z"
  }
];

export const demoServicePrices: ServicePrice[] = [
  {
    "uuid": "sp-001",
    "service_uuid": "svc-001",
    "employee_uuid": null,
    "label": "Standard",
    "label_ar": "عادي",
    "price": 8000,
    "currency": "EGP",
    "active": true
  },
  {
    "uuid": "sp-001s",
    "service_uuid": "svc-001",
    "employee_uuid": "emp-001",
    "label": "Senior Stylist",
    "label_ar": "ستايلست أول",
    "price": 12000,
    "currency": "EGP",
    "active": true
  },
  {
    "uuid": "sp-002",
    "service_uuid": "svc-002",
    "employee_uuid": null,
    "label": "Standard",
    "label_ar": "عادي",
    "price": 25000,
    "currency": "EGP",
    "active": true
  },
  {
    "uuid": "sp-003",
    "service_uuid": "svc-003",
    "employee_uuid": null,
    "label": "Standard",
    "label_ar": "عادي",
    "price": 5000,
    "currency": "EGP",
    "active": true
  },
  {
    "uuid": "sp-004",
    "service_uuid": "svc-004",
    "employee_uuid": null,
    "label": "Standard",
    "label_ar": "عادي",
    "price": 7000,
    "currency": "EGP",
    "active": true
  },
  {
    "uuid": "sp-005",
    "service_uuid": "svc-005",
    "employee_uuid": null,
    "label": "Standard",
    "label_ar": "عادي",
    "price": 35000,
    "currency": "EGP",
    "active": true
  },
  {
    "uuid": "sp-006",
    "service_uuid": "svc-006",
    "employee_uuid": null,
    "label": "Standard",
    "label_ar": "عادي",
    "price": 15000,
    "currency": "EGP",
    "active": true
  }
];

export const demoCustomers: Customer[] = [
  {
    "uuid": "cus-001",
    "phone": "+201012345001",
    "name": "Aaron Ramsdale",
    "name_ar": "آرون",
    "default_locale": "en",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2026-05-01T10:00:00Z"
  },
  {
    "uuid": "cus-002",
    "phone": "+201098765002",
    "name": "Fatima Al-Rashid",
    "name_ar": "فاطمة الرشيد",
    "default_locale": "ar",
    "created_at": "2023-08-20T10:00:00Z",
    "updated_at": "2026-05-01T10:00:00Z"
  },
  {
    "uuid": "cus-003",
    "phone": "+201155667003",
    "name": "Mohamed Ahmed",
    "name_ar": "محمد أحمد",
    "default_locale": "ar",
    "created_at": "2024-03-10T10:00:00Z",
    "updated_at": "2026-05-01T10:00:00Z"
  },
  {
    "uuid": "cus-004",
    "phone": "+201234567004",
    "name": "Sara Johnson",
    "name_ar": "سارة",
    "default_locale": "en",
    "created_at": "2024-06-01T10:00:00Z",
    "updated_at": "2026-05-01T10:00:00Z"
  }
];

export const demoVisits: Visit[] = [
  {
    "uuid": "visit-0001",
    "provider_uuid": "prov-001",
    "branch_uuid": "branch-001",
    "customer_uuid": "cus-002",
    "status": "confirmed",
    "scheduled_start": "2026-06-05T11:00:00Z",
    "scheduled_end": "2026-06-05T13:00:00Z",
    "subtotal": 37000,
    "discount_total": 0,
    "tip_total": 0,
    "total": 37000,
    "currency": "EGP",
    "visit_number": 4,
    "created_at": "2026-06-01T09:00:00Z",
    "updated_at": "2026-06-01T09:00:00Z",
    "line_items": [
      {
        "uuid": "li-0001a",
        "visit_uuid": "visit-0001",
        "service_uuid": "svc-001",
        "employee_uuid": "emp-001",
        "start_time": "2026-06-05T11:00:00Z",
        "duration_minutes": 60,
        "price": 12000,
        "status": "confirmed"
      },
      {
        "uuid": "li-0001b",
        "visit_uuid": "visit-0001",
        "service_uuid": "svc-002",
        "employee_uuid": "emp-002",
        "start_time": "2026-06-05T12:00:00Z",
        "duration_minutes": 120,
        "price": 25000,
        "status": "confirmed"
      }
    ],
    "payment": {
      "uuid": "pay-0001",
      "visit_uuid": "visit-0001",
      "model": "deposit_balance",
      "method": "card",
      "status": "partial",
      "total": 37000,
      "paid_amount": 7400,
      "balance_amount": 29600,
      "currency": "EGP",
      "platform_fee": 500,
      "commission_amount": 3700,
      "created_at": "2026-06-01T09:00:00Z",
      "updated_at": "2026-06-01T09:00:00Z"
    }
  },
  {
    "uuid": "visit-0002",
    "provider_uuid": "prov-002",
    "branch_uuid": "branch-002",
    "customer_uuid": "cus-003",
    "status": "completed",
    "scheduled_start": "2026-05-28T16:00:00Z",
    "scheduled_end": "2026-05-28T16:45:00Z",
    "subtotal": 7000,
    "discount_total": 0,
    "tip_total": 1000,
    "total": 8000,
    "currency": "EGP",
    "visit_number": 2,
    "created_at": "2026-05-28T10:00:00Z",
    "updated_at": "2026-05-28T17:00:00Z",
    "started_at": "2026-05-28T16:00:00Z",
    "completed_at": "2026-05-28T16:45:00Z",
    "line_items": [
      {
        "uuid": "li-0002a",
        "visit_uuid": "visit-0002",
        "service_uuid": "svc-004",
        "employee_uuid": "emp-003",
        "start_time": "2026-05-28T16:00:00Z",
        "duration_minutes": 45,
        "price": 7000,
        "status": "completed",
        "commission_amount": 2800
      }
    ],
    "payment": {
      "uuid": "pay-0002",
      "visit_uuid": "visit-0002",
      "model": "online_upfront",
      "method": "card",
      "status": "paid",
      "total": 8000,
      "paid_amount": 8000,
      "balance_amount": 0,
      "currency": "EGP",
      "platform_fee": 200,
      "commission_amount": 800,
      "paid_at": "2026-05-28T10:00:00Z",
      "created_at": "2026-05-28T10:00:00Z",
      "updated_at": "2026-05-28T16:45:00Z"
    }
  }
];

