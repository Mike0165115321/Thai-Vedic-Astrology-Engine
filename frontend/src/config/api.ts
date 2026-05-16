/**
 * API Configuration
 * 
 * NEXT_PUBLIC_API_URL should be set in environment variables.
 * In development, it defaults to http://localhost:8000
 */

let dynamicPort = null;
if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    dynamicPort = params.get('port');
}

const API_BASE_URL = dynamicPort 
    ? `http://127.0.0.1:${dynamicPort}`
    : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000");

export const API_ENDPOINTS = {
    HISTORY: `${API_BASE_URL}/history/`,
    CALCULATE_CHART: `${API_BASE_URL}/calculate/chart/`,
    CALCULATE_COMPARE: `${API_BASE_URL}/calculate/compare/`,
    TRANSIT_SCANNER: `${API_BASE_URL}/calculate/transit-scanner/scan`,
};

export default API_BASE_URL;
