import axios from 'axios';
import chalk from 'chalk';

const API_KEY = process.env.CRYPTOCOMPARE_API_KEY || '';
const BASE_URL = 'https://min-api.cryptocompare.com/data';

export async function fetchTopCoins(limit = 10) {
    try {
        const response = await axios.get(`${BASE_URL}/top/totalvolfull`, {
            params: {
                limit,
                tsym: 'USD',
                api_key: API_KEY
            }
        });

        return response.data.Data.map(coin => ({
            symbol: coin.CoinInfo.Name,
            fullName: coin.CoinInfo.FullName,
            price: coin.RAW?.USD?.PRICE || 0,
            change24h: coin.RAW?.USD?.CHANGEPCT24HOUR || 0
        }));
    } catch (error) {
        console.error('Error fetching top coins:', error.message);
        return [];
    }
}

export async function listCoins(limit = 10) {
    const coins = await fetchTopCoins(limit);
    
    console.log(chalk.bold('\nTop Cryptocurrencies:'));
    coins.forEach((coin, index) => {
        const change = coin.change24h;
        const changeColor = change >= 0 ? chalk.green : chalk.red;
        const changeSymbol = change >= 0 ? '↑' : '↓';
        
        console.log(
            chalk.gray(`${index + 1}.`),
            chalk.white(coin.fullName.padEnd(20)),
            chalk.yellow(`$${coin.price.toFixed(2)}`.padEnd(12)),
            changeColor(`${changeSymbol} ${Math.abs(change).toFixed(2)}%`)
        );
    });
    console.log();
}

export async function validateCoinPair(pair) {
    try {
        const [fromCoin, toCoin] = pair.split('-');
        const response = await axios.get(`${BASE_URL}/price`, {
            params: {
                fsym: fromCoin,
                tsyms: toCoin,
                api_key: API_KEY
            }
        });

        return response.data[toCoin] !== undefined;
    } catch (error) {
        return false;
    }
}
