import chalk from 'chalk';
import { calculateStats, renderStats } from './stats.js';
import asciichart from 'asciichart';

const DEFAULT_WIDTH = 120;
const DEFAULT_HEIGHT = 30;

// Candlestick colors
const BULLISH_COLOR = chalk.green.bold('█');
const BEARISH_COLOR = chalk.red.bold('█');
const TREND_LINE = chalk.yellow.bold('─');
const WICK_LINE = chalk.gray('│');

// Axis styling
const AXIS_COLOR = chalk.gray;
const AXIS_Y = AXIS_COLOR('│');
const AXIS_X = AXIS_COLOR('─');
const AXIS_CORNER = AXIS_COLOR('└');
const AXIS_TICK = AXIS_COLOR('┴');

/**
 * Renders a candlestick chart
 * @param {Array} data - Array of candle data
 * @param {Object} options - Chart options
 * @returns {string} Rendered chart
 */
export function renderChart(data, options = {}) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        console.error('No data available to render chart');
        return;
    }

    try {
        const width = options.width || DEFAULT_WIDTH;
        const height = options.height || DEFAULT_HEIGHT;
        const trendLine = calculateTrendLine(data);

        let chart = '\n'; // Add newline before chart

        // Add title if provided
        if (options.pair) {
            const title = chalk.bold(`${options.pair} Price Chart`);
            const padding = ' '.repeat(Math.floor((width - title.length) / 2));
            chart += padding + title + '\n\n';
        } else {
            chart += '\n'; // Add extra line if no title
        }

        chart += renderCandles(data, width, height, trendLine);

        // Add legend if not disabled
        if (!options.disableLegend) {
            chart +=
                '\n\n' + renderStats(calculateStats(data, trendLine, options.pair));
        } else {
            chart += '\n'; // Add newline even if legend is disabled
        }

        chart += '\n'; // Add final newline

        return chart;
    } catch (error) {
        console.error('Error rendering chart:', error.message);
    }
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
 * Format price for y-axis labels
 * @param {number} price - Price to format
 * @returns {string} Formatted price
 */
function formatAxisPrice(price) {
    if (price >= 1000) {
        return `${(price / 1000).toFixed(1)}k`;
    }
    return price.toFixed(price < 1 ? 4 : 2);
}

/**
 * Format timestamp for x-axis labels
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted time
 */
function formatAxisTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Renders candlesticks with axes
 * @param {Array} data - Array of candle data
 * @param {number} width - Chart width
 * @param {number} height - Chart height
 * @param {Array} trendLine - Trend line data points
 * @returns {string} Rendered candlesticks with axes
 */
function renderCandles(data, width, height, trendLine) {
    // Calculate price range
    const prices = data.flatMap(candle => [candle.high, candle.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    // Add padding for axes
    const PRICE_AXIS_WIDTH = 10;
    const TIME_AXIS_HEIGHT = 2;
    const chartWidth = width - PRICE_AXIS_WIDTH;
    const chartHeight = height - TIME_AXIS_HEIGHT;

    // Initialize chart grid with space for axes
    const grid = Array(height)
        .fill()
        .map(() => Array(width).fill(' '));

    // Calculate scaling factors
    const timeScale = chartWidth / data.length;
    const priceScale = chartHeight / priceRange;

    // Plot trend line
    trendLine.forEach((price, i) => {
        const x = Math.floor(i * timeScale) + PRICE_AXIS_WIDTH;
        const y = Math.floor((maxPrice - price) * priceScale);
        if (x >= PRICE_AXIS_WIDTH && x < width && y >= 0 && y < chartHeight) {
            grid[y][x] = TREND_LINE;
        }
    });

    // Plot candlesticks
    data.forEach((candle, i) => {
        const x = Math.floor(i * timeScale) + PRICE_AXIS_WIDTH;
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
            if (y >= 0 && y < chartHeight) {
                grid[y][x] = WICK_LINE;
            }
        }

        // Draw body
        const bodyStart = Math.min(openY, closeY);
        const bodyEnd = Math.max(openY, closeY);
        for (let y = bodyStart; y <= bodyEnd; y++) {
            if (y >= 0 && y < chartHeight) {
                grid[y][x] = candleColor;
            }
        }
    });

    // Draw y-axis (price)
    for (let y = 0; y < chartHeight; y++) {
        grid[y][PRICE_AXIS_WIDTH - 1] = AXIS_Y;

        // Add price labels at regular intervals
        if (y % Math.floor(chartHeight / 4) === 0) {
            const price = maxPrice - y / priceScale;
            const label = formatAxisPrice(price);
            const labelStart = PRICE_AXIS_WIDTH - label.length - 2;
            for (let i = 0; i < label.length; i++) {
                grid[y][labelStart + i] = label[i];
            }
        }
    }

    // Draw x-axis (time)
    const timeAxisY = chartHeight;
    for (let x = PRICE_AXIS_WIDTH; x < width; x++) {
        grid[timeAxisY][x] = AXIS_X;
    }

    // Add corner
    grid[timeAxisY][PRICE_AXIS_WIDTH - 1] = AXIS_CORNER;

    // Add time labels
    const timeInterval = Math.floor(data.length / 4); // Show 4 time labels
    for (let i = 0; i <= data.length; i += timeInterval) {
        if (i >= data.length) continue;
        const x = Math.floor(i * timeScale) + PRICE_AXIS_WIDTH;
        if (x >= width) continue;

        grid[timeAxisY][x] = AXIS_TICK;
        const time = formatAxisTime(data[i].time);
        const labelStart = x - Math.floor(time.length / 2);
        for (let j = 0; j < time.length; j++) {
            if (labelStart + j >= width) break;
            grid[timeAxisY + 1][labelStart + j] = time[j];
        }
    }

    // Convert grid to string
    return grid.map(row => row.join('')).join('\n');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { renderChart };
}
