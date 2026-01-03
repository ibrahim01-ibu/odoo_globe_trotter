export const COUNTRIES = [
    { code: 'US', name: 'United States', currency: 'USD' },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
    { code: 'IN', name: 'India', currency: 'INR' },
    { code: 'JP', name: 'Japan', currency: 'JPY' },
    { code: 'AU', name: 'Australia', currency: 'AUD' },
    { code: 'CA', name: 'Canada', currency: 'CAD' },
    { code: 'CH', name: 'Switzerland', currency: 'CHF' },
    { code: 'CN', name: 'China', currency: 'CNY' },
    { code: 'DE', name: 'Germany', currency: 'EUR' },
    { code: 'FR', name: 'France', currency: 'EUR' },
    { code: 'IT', name: 'Italy', currency: 'EUR' },
    { code: 'ES', name: 'Spain', currency: 'EUR' },
    { code: 'NL', name: 'Netherlands', currency: 'EUR' },
    { code: 'SG', name: 'Singapore', currency: 'SGD' },
    { code: 'AE', name: 'United Arab Emirates', currency: 'AED' },
    { code: 'TH', name: 'Thailand', currency: 'THB' },
    { code: 'MY', name: 'Malaysia', currency: 'MYR' },
    { code: 'KR', name: 'South Korea', currency: 'KRW' },
    { code: 'NZ', name: 'New Zealand', currency: 'NZD' },
    { code: 'MX', name: 'Mexico', currency: 'MXN' },
    { code: 'BR', name: 'Brazil', currency: 'BRL' },
    { code: 'ZA', name: 'South Africa', currency: 'ZAR' },
];

export const CURRENCIES = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿' },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
    { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
];

export function formatCurrency(amount: number, currencyCode: string): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function getCurrencyForCountry(countryCode: string): string {
    const country = COUNTRIES.find(c => c.code === countryCode);
    return country?.currency || 'USD';
}
