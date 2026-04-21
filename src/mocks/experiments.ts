export interface AdExperiment {
    id: string;
    name: string;
    hypothesis: string;
    status: 'running' | 'completed' | 'paused';
    started_at: string;
    ended_at: string | null;
    variants: {
        A: { id: string; label: string; impressions: number; clicks: number; conversions: number };
        B: { id: string; label: string; impressions: number; clicks: number; conversions: number };
    };
    traffic_split: number;
}

export const mockExperiments: AdExperiment[] = [
    {
        id: 'exp-1',
        name: 'Summer Sale — Headline Test',
        hypothesis: 'Urgency-driven copy ("Ends Friday") outperforms discount copy ("50% OFF")',
        status: 'completed',
        started_at: '2026-03-15T00:00:00Z',
        ended_at: '2026-04-10T23:59:59Z',
        variants: {
            A: { id: 'ad-sum-a', label: '50% OFF All Services', impressions: 52000, clicks: 4100, conversions: 380 },
            B: { id: 'ad-sum-b', label: 'Summer Deals — Ends Friday', impressions: 51500, clicks: 4950, conversions: 520 },
        },
        traffic_split: 50,
    },
    {
        id: 'exp-2',
        name: 'Barber Banner — Image vs Testimonial',
        hypothesis: 'Customer testimonial card drives more clicks than product image banner',
        status: 'running',
        started_at: '2026-04-05T00:00:00Z',
        ended_at: null,
        variants: {
            A: { id: 'ad-brb-a', label: 'Hero Image Banner', impressions: 18200, clicks: 1420, conversions: 95 },
            B: { id: 'ad-brb-b', label: 'Testimonial Card', impressions: 18100, clicks: 1610, conversions: 118 },
        },
        traffic_split: 50,
    },
    {
        id: 'exp-3',
        name: 'Spa Ad — Price Anchor',
        hypothesis: 'Showing "Was 800 EGP" vs just final price lifts conversion',
        status: 'running',
        started_at: '2026-04-08T00:00:00Z',
        ended_at: null,
        variants: {
            A: { id: 'ad-spa-a', label: 'Final Price Only', impressions: 6200, clicks: 480, conversions: 32 },
            B: { id: 'ad-spa-b', label: 'Price Anchor (Was 800)', impressions: 6100, clicks: 510, conversions: 38 },
        },
        traffic_split: 50,
    },
    {
        id: 'exp-4',
        name: 'Push CTA — Verb Variation',
        hypothesis: '"Book now" vs "See availability" impacts tap-through',
        status: 'paused',
        started_at: '2026-03-28T00:00:00Z',
        ended_at: null,
        variants: {
            A: { id: 'ad-psh-a', label: 'Book Now', impressions: 8400, clicks: 720, conversions: 62 },
            B: { id: 'ad-psh-b', label: 'See Availability', impressions: 8300, clicks: 680, conversions: 55 },
        },
        traffic_split: 50,
    },
];
