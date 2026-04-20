/**
 * Export data as CSV file download
 */
export function exportToCSV<T extends object>(data: T[], filename: string, columns?: { key: string; label: string }[]) {
    if (data.length === 0) return;

    const keys = columns ? columns.map(c => c.key) : Object.keys(data[0] as object);
    const headers = columns ? columns.map(c => c.label) : keys;

    const csvRows = [
        headers.join(','),
        ...data.map(row =>
            keys.map(k => {
                const val = String((row as Record<string, unknown>)[k] ?? '');
                return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
            }).join(',')
        ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(textarea);
        return ok;
    }
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency = 'EGP'): string {
    return `${currency} ${amount.toLocaleString()}`;
}

/**
 * Format date
 */
export function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString();
}
