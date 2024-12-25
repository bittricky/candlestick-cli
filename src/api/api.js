import axios from 'axios';

const API_KEY = process.env.CRYPTOCOMPARE_API_KEY || '';
const BASE_URL = 'https://min-api.cryptocompare.com/data';

/**
 * Fetches candle data for a given cryptocurrency pair
 * @param {string} fromCoin - Base cryptocurrency (e.g., 'BTC')
 * @param {string} toCoin - Quote currency (e.g., 'USD')
 * @param {Object} timeframe - Timeframe options
 * @param {number} timeframe.days - Number of days
 * @param {number} timeframe.hours - Number of hours
 * @param {number} timeframe.mins - Number of minutes
 * @returns {Promise<Array>} Array of candle data
 */
export async function fetchCandleData(fromCoin, toCoin = 'USD', timeframe = {}) {
    try {
        // Calculate total minutes
        const totalMinutes = (timeframe.days || 0) * 24 * 60 +
                           (timeframe.hours || 0) * 60 +
                           (timeframe.mins || 0);

        // Default to 24 hours if no timeframe specified
        const minutes = totalMinutes || 24 * 60;

        // Determine appropriate endpoint based on timeframe
        let endpoint = '/histominute';
        let limit = minutes;

        if (minutes >= 24 * 60) {
            endpoint = '/histohour';
            limit = Math.ceil(minutes / 60);
        }
        if (minutes >= 24 * 60 * 7) {
            endpoint = '/histoday';
            limit = Math.ceil(minutes / (24 * 60));
        }

        const response = await axios.get(`${BASE_URL}${endpoint}`, {
            params: {
                fsym: fromCoin.toUpperCase(),
                tsym: toCoin.toUpperCase(),
                limit,
                api_key: API_KEY
            }
        });

        if (response.data.Response === 'Error') {
            throw new Error(response.data.Message);
        }

        return response.data.Data;
    } catch (error) {
        console.error('Error fetching candle data:', error.message);
        throw error;
    }
}

/**
 * Fetches current price for a cryptocurrency pair
 * @param {string} fromCoin - Base cryptocurrency (e.g., 'BTC')
 * @param {string} toCoin - Quote currency (e.g., 'USD')
 * @returns {Promise<number>} Current price
 */
export async function fetchCurrentPrice(fromCoin, toCoin = 'USD') {
    try {
        const response = await axios.get(`${BASE_URL}/price`, {
            params: {
                fsym: fromCoin.toUpperCase(),
                tsyms: toCoin.toUpperCase(),
                api_key: API_KEY
            }
        });

        if (response.data.Response === 'Error') {
            throw new Error(response.data.Message);
        }

        return response.data[toCoin.toUpperCase()];
    } catch (error) {
        console.error('Error fetching current price:', error.message);
        throw error;
    }
}

/**
 * Fetches list of all available coins
 * @returns {Promise<Array>} Array of coin data
 */
export async function fetchCoinList() {
    try {
        const response = await axios.get(`${BASE_URL}/all/coinlist`, {
            params: {
                api_key: API_KEY
            }
        });

        if (response.data.Response === 'Error') {
            throw new Error(response.data.Message);
        }

        return Object.values(response.data.Data);
    } catch (error) {
        console.error('Error fetching coin list:', error.message);
        throw error;
    }
}

/**
 * Fetches top coins by market cap
 * @param {number} limit - Number of coins to fetch
 * @returns {Promise<Array>} Array of top coins
 */
export async function fetchTopCoins(limit = 10) {
    try {
        const response = await axios.get(`${BASE_URL}/top/mktcapfull`, {
            params: {
                limit,
                tsym: 'USD',
                api_key: API_KEY
            }
        });

        if (response.data.Response === 'Error') {
            throw new Error(response.data.Message);
        }

        return response.data.Data;
    } catch (error) {
        console.error('Error fetching top coins:', error.message);
        throw error;
    }
}
