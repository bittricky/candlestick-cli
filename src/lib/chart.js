import chalk from 'chalk';
import { calculateStats, renderStats } from './stats.js';
import { fetchCoinList, fetchTopCoins } from '../api/api.js';

const DEFAULT_WIDTH = 120;
const DEFAULT_HEIGHT = 30;

// Candlestick colors
const BULLISH_COLOR = chalk.green.bold('█');
const BEARISH_COLOR = chalk.red.bold('█');
const TREND_LINE = chalk.yellow.bold('─');
const WICK_LINE = chalk.gray('│');

/**
 * Renders a candlestick chart
 * @param {Array} data - Array of candle data
 * @param {Object} options - Chart options
 * @returns {string} Rendered chart
 */
export function renderChart(data, options = {}) {
	const width = options.width || DEFAULT_WIDTH;
	const height = options.height || DEFAULT_HEIGHT;
	const trendLine = calculateTrendLine(data);

	let chart = '';
	chart += renderCandles(data, width, height, trendLine);

	// Add legend if not disabled
	if (!options.disableLegend) {
		chart +=
			'\n' + renderStats(calculateStats(data, trendLine, options.pair));
	}

	return chart;
}

/**
 * Calculates trend line data
 * @param {Array} data - Array of candle data
 * @returns {Array} Trend line data points
 */
function calculateTrendLine(data) {
	const closes = data.map(candle => candle.close);
	const n = closes.length;
	const x = Array.from({ length: n }, (_, i) => i);
	const sumX = x.reduce((a, b) => a + b, 0);
	const sumY = closes.reduce((a, b) => a + b, 0);
	const sumXY = x.reduce((sum, x, i) => sum + x * closes[i], 0);
	const sumXX = x.reduce((sum, x) => sum + x * x, 0);

	const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
	const intercept = (sumY - slope * sumX) / n;

	return x.map(x => slope * x + intercept);
}

/**
 * Renders candlesticks
 * @param {Array} data - Array of candle data
 * @param {number} width - Chart width
 * @param {number} height - Chart height
 * @param {Array} trendLine - Trend line data points
 * @returns {string} Rendered candlesticks
 */
function renderCandles(data, width, height, trendLine) {
	// Calculate price range
	const prices = data.flatMap(candle => [candle.high, candle.low]);
	const minPrice = Math.min(...prices);
	const maxPrice = Math.max(...prices);
	const priceRange = maxPrice - minPrice;

	// Initialize chart grid
	const grid = Array(height)
		.fill()
		.map(() => Array(width).fill(' '));

	// Calculate scaling factors
	const timeScale = width / data.length;
	const priceScale = height / priceRange;

	// Plot trend line
	trendLine.forEach((price, i) => {
		const x = Math.floor(i * timeScale);
		const y = Math.floor((maxPrice - price) * priceScale);
		if (x >= 0 && x < width && y >= 0 && y < height) {
			grid[y][x] = TREND_LINE;
		}
	});

	// Plot candlesticks
	data.forEach((candle, i) => {
		const x = Math.floor(i * timeScale);
		if (x >= width) return;

		// Calculate y-coordinates
		const openY = Math.floor((maxPrice - candle.open) * priceScale);
		const closeY = Math.floor((maxPrice - candle.close) * priceScale);
		const highY = Math.floor((maxPrice - candle.high) * priceScale);
		const lowY = Math.floor((maxPrice - candle.low) * priceScale);

		// Draw candlestick
		const isBullish = candle.close >= candle.open;
		const candleColor = isBullish ? BULLISH_COLOR : BEARISH_COLOR;

		// Draw wick
		for (let y = highY; y <= lowY; y++) {
			if (y >= 0 && y < height) {
				grid[y][x] = WICK_LINE;
			}
		}

		// Draw body
		const bodyStart = Math.min(openY, closeY);
		const bodyEnd = Math.max(openY, closeY);
		for (let y = bodyStart; y <= bodyEnd; y++) {
			if (y >= 0 && y < height) {
				grid[y][x] = candleColor;
			}
		}
	});

	// Convert grid to string
	return grid.map(row => row.join('')).join('\n');
}

export async function listCoins() {
	try {
		console.log(chalk.gray('Fetching available coins...'));
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

export async function getTopCoins(limit) {
	try {
		console.log(chalk.gray('Fetching top coins...'));
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
