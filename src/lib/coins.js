import chalk from 'chalk';
import { fetchCoinList, fetchTopCoins } from '../api/api.js';

/**
 * Lists all available coins
 * @returns {Promise<Array>} Array of formatted coin data
 */
export async function listCoins() {
    try {
        console.log(chalk.gray('Fetching available coins... \n'));
        const coins = await fetchCoinList();
        return coins.map(coin => ({
            id: coin.Symbol,
            symbol: coin.Symbol,
            name: coin.CoinName
        }));
    } catch (error) {
        console.error(chalk.red('Error fetching coin list:', error.message));
        process.exit(1);
    }
}

/**
 * Gets top coins by market cap
 * @param {number} limit - Number of coins to fetch
 * @returns {Promise<Array>} Array of formatted top coin data
 */
export async function getTopCoins(limit = 10) {
    try {
        console.log(chalk.gray('Fetching top coins... \n'));
        const coins = await fetchTopCoins(limit);
        return coins.map(item => ({
            symbol: item.CoinInfo.Name,
            name: item.CoinInfo.FullName,
            current_price: item.RAW?.USD?.PRICE || 0,
            market_cap: item.RAW?.USD?.MKTCAP || 0
        }));
    } catch (error) {
        console.error(chalk.red('Error fetching top coins:', error.message));
        process.exit(1);
    }
}
