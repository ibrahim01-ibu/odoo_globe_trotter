// Currency utilities for GlobeTrotter
// All internal calculations use USD as base currency
// Conversion happens at response time

// Static FX rates (relative to USD)
// In production, these would be fetched from an API periodically
export const FX_RATES: Record<string, number> = {
    USD: 1.00,
    EUR: 0.92,
    GBP: 0.78,
    INR: 83.00,
    JPY: 149.00,
    AUD: 1.53,
    CAD: 1.36,
    CHF: 0.88,
    CNY: 7.24,
    SGD: 1.34,
    AED: 3.67,
    THB: 34.50,
    MYR: 4.47,
    KRW: 1320.00,
    NZD: 1.62,
    MXN: 17.15,
    BRL: 4.97,
    ZAR: 18.50,
};

// Currency metadata
export const CURRENCIES: Record<string, { name: string; symbol: string }> = {
    USD: { name: 'US Dollar', symbol: '$' },
    EUR: { name: 'Euro', symbol: '€' },
    GBP: { name: 'British Pound', symbol: '£' },
    INR: { name: 'Indian Rupee', symbol: '₹' },
    JPY: { name: 'Japanese Yen', symbol: '¥' },
    AUD: { name: 'Australian Dollar', symbol: 'A$' },
    CAD: { name: 'Canadian Dollar', symbol: 'C$' },
    CHF: { name: 'Swiss Franc', symbol: 'CHF' },
    CNY: { name: 'Chinese Yuan', symbol: '¥' },
    SGD: { name: 'Singapore Dollar', symbol: 'S$' },
    AED: { name: 'UAE Dirham', symbol: 'د.إ' },
    THB: { name: 'Thai Baht', symbol: '฿' },
    MYR: { name: 'Malaysian Ringgit', symbol: 'RM' },
    KRW: { name: 'South Korean Won', symbol: '₩' },
    NZD: { name: 'New Zealand Dollar', symbol: 'NZ$' },
    MXN: { name: 'Mexican Peso', symbol: 'MX$' },
    BRL: { name: 'Brazilian Real', symbol: 'R$' },
    ZAR: { name: 'South African Rand', symbol: 'R' },
};

// Country to default currency mapping
export const COUNTRY_CURRENCY: Record<string, string> = {
    US: 'USD',
    GB: 'GBP',
    UK: 'GBP',
    IN: 'INR',
    JP: 'JPY',
    AU: 'AUD',
    CA: 'CAD',
    CH: 'CHF',
    CN: 'CNY',
    SG: 'SGD',
    AE: 'AED',
    TH: 'THB',
    MY: 'MYR',
    KR: 'KRW',
    NZ: 'NZD',
    MX: 'MXN',
    BR: 'BRL',
    ZA: 'ZAR',
    // European countries use EUR
    DE: 'EUR',
    FR: 'EUR',
    IT: 'EUR',
    ES: 'EUR',
    NL: 'EUR',
    BE: 'EUR',
    AT: 'EUR',
    PT: 'EUR',
    GR: 'EUR',
    IE: 'EUR',
    FI: 'EUR',
};

// Supported currencies list
export const SUPPORTED_CURRENCIES = Object.keys(CURRENCIES);

/**
 * Convert amount from USD to target currency
 * @param amountUSD Amount in USD (internal base currency)
 * @param currency Target currency code (ISO 4217)
 * @returns Converted amount
 */
export function convert(amountUSD: number, currency: string): number {
    const rate = FX_RATES[currency] ?? FX_RATES.USD;
    return Math.round(amountUSD * rate);
}

/**
 * Get the currency symbol for a currency code
 */
export function getCurrencySymbol(currency: string): string {
    return CURRENCIES[currency]?.symbol ?? '$';
}

/**
 * Get default currency for a country
 */
export function getDefaultCurrency(countryCode: string): string {
    return COUNTRY_CURRENCY[countryCode] ?? 'USD';
}

/**
 * Validate if a currency code is supported
 */
export function isValidCurrency(currency: string): boolean {
    return currency in CURRENCIES;
}
