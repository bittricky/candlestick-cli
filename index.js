#!/usr/bin/env node

/**
 * candlestick
 * Command line tool to view trading charts from your terminal
 *
 * @author Mitul Patel <https://mitulpa.tel>
 */

import { Command } from 'commander';
import { renderChart } from './src/lib/chart.js';
import { listCoins, getTopCoins } from './src/lib/coins.js';
import { fetchCandleData } from './src/api/api.js';

const program = new Command();

program
	.name('candlestick')
	.description('CLI tool for viewing cryptocurrency candlestick charts')
	.version('1.0.0')
	.option('-l, --list', 'List available coins')
	.option('-t, --toplist <number>', 'List top coins by market cap')
	.option('-c, --coin <string>', 'Coin symbol (e.g. BTC, ETH)')
	.option('-r, --currency <string>', 'Currency symbol (e.g. USD, EUR)', 'USD')
	.option('-d, --days <number>', 'Number of days')
	.option('-H, --hours <number>', 'Number of hours')
	.option('-m, --mins <number>', 'Number of minutes')
	.option('-w, --width <number>', 'Chart width')
	.option('-h, --height <number>', 'Chart height')
	.option('--disable-legend', 'Disable chart legend');

program.parse();

const options = program.opts();

(async () => {
	try {
		if (options.list) {
			const limit = parseInt(options.toplist) || 10;
			await listCoins(limit);
			process.exit(0);
		}

		if (options.toplist) {
			const limit = parseInt(options.toplist) || 10;
			await getTopCoins(limit);
			process.exit(0);
		}

		if (!options.coin) {
			console.error('Please specify a coin using -c or --coin');
			process.exit(1);
		}

		const timeframe = {
			days: parseInt(options.days) || 0,
			hours: parseInt(options.hours) || 0,
			mins: parseInt(options.mins) || 0
		};

		// Default to 24 hours if no timeframe specified
		if (!timeframe.days && !timeframe.hours && !timeframe.mins) {
			timeframe.hours = 24;
		}

		const data = await fetchCandleData(
			options.coin,
			options.currency,
			timeframe
		);

		const chartOptions = {
			width: parseInt(options.width) || undefined,
			height: parseInt(options.height) || undefined,
			disableLegend: options.disableLegend,
			pair: `${options.coin}-${options.currency}`
		};

		console.log(await renderChart(data, chartOptions));
	} catch (error) {
		console.error('Error:', error.message);
		process.exit(1);
	}
})();
