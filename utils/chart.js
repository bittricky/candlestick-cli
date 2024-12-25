import chalk from 'chalk';
import axios from 'axios';
import moment from 'moment';

const DEFAULT_WIDTH = 120;
const DEFAULT_HEIGHT = 30;

// Candlestick colors
const BULLISH_COLOR = chalk.green.bold('█');
const BEARISH_COLOR = chalk.red.bold('█');
const TREND_LINE = chalk.yellow.bold('─');
const WICK_LINE = chalk.gray('│');

// Create axios instance with default config
const api = axios.create({
    baseURL: 'https://min-api.cryptocompare.com/data',
    timeout: 10000,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

// Add response interceptor for error handling
api.interceptors.response.use(null, async (error) => {
    if (error.response) {
        if (error.response.status === 429) {
            console.log(chalk.yellow('Rate limit reached. Waiting before retrying...'));
            await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
            return api.request(error.config);
        }

        throw new Error(`API Error: ${error.response.data.Message || error.message}`);
    }
    throw error;
});

// Calculate Simple Moving Average (SMA)
function calculateSMA(data, period = 20) {
    const sma = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            sma.push(null);
            continue;
        }
        
        const sum = data.slice(i - period + 1, i + 1)
            .reduce((acc, candle) => acc + candle.close, 0);
        sma.push(sum / period);
    }
    return sma;
}

// Calculate trend line using linear regression
function calculateTrendLine(data) {
    const n = data.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    
    // Calculate sums for linear regression
    data.forEach((candle, i) => {
        sumX += i;
        sumY += candle.close;
        sumXY += i * candle.close;
        sumXX += i * i;
    });
    
    // Calculate linear regression coefficients (y = mx + b)
    const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const b = (sumY - m * sumX) / n;
    
    // Generate trend line points
    return data.map((_, i) => m * i + b);
}

export async function fetchCryptoData(coin, currency, timeframe) {
    try {
        let endpoint = '';
        let limit = 100; // Default number of data points
        let aggregate = 1;

        // Calculate the appropriate endpoint and aggregation
        if (timeframe.mins) {
            endpoint = '/v2/histominute';
            limit = Math.min(timeframe.mins, 2000);
        } else if (timeframe.hours) {
            endpoint = '/v2/histohour';
            limit = Math.min(timeframe.hours, 2000);
        } else if (timeframe.days) {
            endpoint = '/v2/histoday';
            limit = Math.min(timeframe.days, 2000);
        } else {
            endpoint = '/v2/histohour';
            limit = 24; // Default 24 hours
        }

        console.log(chalk.gray('Fetching market data...'));
        
        const response = await api.get(endpoint, {
            params: {
                fsym: coin.toUpperCase(),
                tsym: currency.toUpperCase(),
                limit: limit,
                aggregate: aggregate
            }
        });

        if (!response.data.Data || !response.data.Data.Data || response.data.Data.Data.length === 0) {
            throw new Error('No price data available for the specified timeframe.');
        }

        return response.data.Data.Data;
    } catch (error) {
        if (error.response && error.response.data && error.response.data.Message) {
            console.error(chalk.red(error.response.data.Message));
        } else {
            console.error(chalk.red(error.message));
        }
        process.exit(1);
    }
}

export function renderChart(data, options = {}) {
    const width = options.width || DEFAULT_WIDTH;
    const height = options.height || DEFAULT_HEIGHT;
    const chartHeight = height - 4; // Reserve space for legend
    
    // Calculate trend line
    const trendLine = calculateTrendLine(data);
    
    // Calculate price range including trend line values
    const prices = data.flatMap(candle => [candle.high, candle.low]);
    prices.push(...trendLine); // Include trend line values in price range
    
    let minPrice = options.min !== undefined ? options.min : Math.min(...prices);
    let maxPrice = options.max !== undefined ? options.max : Math.max(...prices);
    
    // Ensure minimum range if specified
    if (options.minRange) {
        const range = maxPrice - minPrice;
        if (range < options.minRange) {
            const middle = (maxPrice + minPrice) / 2;
            minPrice = middle - options.minRange / 2;
            maxPrice = middle + options.minRange / 2;
        }
    }

    // Calculate scaling factors
    const priceRange = maxPrice - minPrice;
    const priceToRow = (price) => {
        return Math.round((maxPrice - price) / priceRange * (chartHeight - 1));
    };

    // Create empty chart grid
    const grid = Array(chartHeight).fill().map(() => Array(width).fill(' '));

    // Calculate width of each candlestick
    const candleWidth = Math.max(1, Math.floor((width - 10) / data.length));
    const spacing = Math.max(1, Math.floor(candleWidth / 3));
    const bodyWidth = Math.max(1, candleWidth - spacing * 2);

    // Draw trend line first (so it appears behind candlesticks)
    trendLine.forEach((price, i) => {
        const x = i * (candleWidth + 1) + Math.floor(candleWidth / 2);
        const row = priceToRow(price);
        if (row >= 0 && row < chartHeight && x < width) {
            grid[row][x] = TREND_LINE;
        }
    });

    // Draw candlesticks
    data.forEach((candle, i) => {
        const x = i * (candleWidth + 1);
        if (x >= width) return;

        const openRow = priceToRow(candle.open);
        const closeRow = priceToRow(candle.close);
        const highRow = priceToRow(candle.high);
        const lowRow = priceToRow(candle.low);

        // Draw price line (wick)
        for (let row = highRow; row <= lowRow; row++) {
            if (row >= 0 && row < chartHeight && x < width) {
                grid[row][x + Math.floor(candleWidth / 2)] = WICK_LINE;
            }
        }

        // Draw candlestick body
        const isGreen = candle.close > candle.open;
        const bodyChar = isGreen ? BULLISH_COLOR : BEARISH_COLOR;
        const [bodyTop, bodyBottom] = isGreen ? [closeRow, openRow] : [openRow, closeRow];

        for (let row = bodyTop; row <= bodyBottom; row++) {
            if (row >= 0 && row < chartHeight) {
                for (let j = 0; j < bodyWidth; j++) {
                    const col = x + spacing + j;
                    if (col < width) {
                        grid[row][col] = bodyChar;
                    }
                }
            }
        }
    });

    // Convert grid to string with price scale
    let chart = '';
    grid.forEach((row, i) => {
        const price = maxPrice - (i / (chartHeight - 1)) * priceRange;
        chart += chalk.gray(price.toFixed(2).padStart(8)) + ' ' + row.join('') + '\n';
    });

    // Add time scale
    const timeScale = '\n' + chalk.gray(' '.repeat(8) + '┴' + '─'.repeat(width - 1)) + '\n';
    chart += timeScale;

    // Add legend if not disabled
    if (!options.disableLegend) {
        chart += '\n' + renderStats(calculateStats(data, trendLine));
    }

    return chart;
}

function calculateStats(data, trendLine) {
    const latest = data[data.length - 1];
    const prices = data.map(candle => candle.close);
    const highs = data.map(candle => candle.high);
    const lows = data.map(candle => candle.low);

    const current = latest.close;
    const min = Math.min(...lows);
    const max = Math.max(...highs);
    const avg = prices.reduce((sum, val) => sum + val, 0) / prices.length;
    const pctFromAvg = ((current - avg) / avg) * 100;
    const volume = latest.volumeto;

    // Calculate trend direction
    const trendStart = trendLine[0];
    const trendEnd = trendLine[trendLine.length - 1];
    const trendDirection = trendEnd > trendStart ? 'Upward' : 'Downward';
    const trendStrength = Math.abs((trendEnd - trendStart) / trendStart * 100).toFixed(2);

    return { current, min, max, avg, pctFromAvg, volume, trendDirection, trendStrength };
}

function renderStats(stats) {
    const trendColor = stats.trendDirection === 'Upward' ? chalk.green : chalk.red;
    return chalk`
{bold Stats:}
Current: ${stats.current.toFixed(2)}
Low: ${stats.min.toFixed(2)}
High: ${stats.max.toFixed(2)}
Average: ${stats.avg.toFixed(2)}
Volume: ${stats.volume.toFixed(2)}
% from avg: ${stats.pctFromAvg > 0 ? chalk.green('+' + stats.pctFromAvg.toFixed(2)) : chalk.red(stats.pctFromAvg.toFixed(2))}%
Trend: ${trendColor(stats.trendDirection)} (${stats.trendStrength}% slope)

Legend:
${chalk.green.bold('█')} Bullish candle
${chalk.red.bold('█')} Bearish candle
${chalk.yellow.bold('─')} Trend line
`;

}

export async function listCoins() {
    try {
        console.log(chalk.gray('Fetching available coins...'));
        const response = await api.get('/all/coinlist');

        // Format the response to match our expected structure
        return Object.values(response.data.Data).map(coin => ({
            id: coin.Symbol,
            symbol: coin.Symbol,
            name: coin.CoinName
        }));
    } catch (error) {
        console.error(chalk.red('Error fetching coin list:', error.message));
        process.exit(1);
    }
}

export async function getTopCoins(limit) {
    try {
        console.log(chalk.gray('Fetching top coins...'));
        const response = await api.get('/top/mktcapfull', {
            params: {
                limit: limit,
                tsym: 'USD'
            }
        });

        // Format the response to match our expected structure
        return response.data.Data.map(item => ({
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
