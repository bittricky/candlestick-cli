import chalk from 'chalk';
import Table from 'cli-table3';

// Formatting helpers
const formatPrice = (price, includeDollar = true) => {
	const formatted = price.toFixed(2);
	return includeDollar ? `$${formatted}` : formatted;
};

const formatChange = change => {
	const sign = change >= 0 ? '+' : '';
	const color = change >= 0 ? chalk.green : chalk.red;
	return color(`${sign}${change.toFixed(2)}%`);
};

export function calculateStats(data, trendLine, pair) {
	const latest = data[data.length - 1];
	const prices = data.map(candle => candle.close);
	const highs = data.map(candle => candle.high);
	const lows = data.map(candle => candle.low);

	// Calculate basic stats
	const current = latest.close;
	const min = Math.min(...lows);
	const max = Math.max(...highs);
	const avg = prices.reduce((sum, val) => sum + val, 0) / prices.length;
	const volume = latest.volumeto;

	// Calculate percentage changes for different timeframes
	const getChange = periods => {
		if (data.length < periods) return 0;
		const oldPrice = data[data.length - periods].close;
		return ((current - oldPrice) / oldPrice) * 100;
	};

	const changes = {
		'5m': getChange(5),
		'30m': getChange(30),
		'1h': getChange(60),
		'12h': getChange(720),
		'1d': getChange(1440)
	};

	// Calculate trend
	const trendStart = trendLine[0];
	const trendEnd = trendLine[trendLine.length - 1];
	const trendDirection = trendEnd > trendStart ? 'buy' : 'sell';

	// Trading data
	const trades = {
		last: current,
		side: trendDirection,
		size: (volume * 0.01).toFixed(4), // Example size calculation
		bought: (volume * 0.1).toFixed(2), // Example bought calculation
		sold: (volume * 0.05).toFixed(2), // Example sold calculation
		buys: Math.floor(volume * 0.001), // Example buys calculation
		sells: Math.floor(volume * 0.0005) // Example sells calculation
	};

	return {
		pair,
		current,
		min,
		max,
		avg,
		volume,
		changes,
		trades
	};
}

export function renderStats(stats) {
	let output = '';

	// Chart stats table
	const statsTable = new Table({
		head: ['pair', 'current', 'low', 'high', 'average', '% of average'],
		style: {
			head: ['gray'],
			border: ['gray']
		},
		chars: {
			top: '─',
			'top-mid': '┬',
			'top-left': '┌',
			'top-right': '┐',
			bottom: '─',
			'bottom-mid': '┴',
			'bottom-left': '└',
			'bottom-right': '┘',
			left: '│',
			'left-mid': '├',
			mid: '─',
			'mid-mid': '┼',
			right: '│',
			'right-mid': '┤',
			middle: '│'
		}
	});

	// Add row to stats table
	statsTable.push([
		stats.pair,
		formatPrice(stats.current),
		formatPrice(stats.min),
		formatPrice(stats.max),
		formatPrice(stats.avg),
		formatChange(((stats.current - stats.avg) / stats.avg) * 100)
	]);

	output += chalk.bold('Chart stats\n');
	output += statsTable.toString() + '\n\n';

	// Change table
	const changeTable = new Table({
		head: ['pair', '5m:', '30m:', '1h:', '12h:', '1d:'],
		style: {
			head: ['gray'],
			border: ['gray']
		},
		chars: {
			top: '─',
			'top-mid': '┬',
			'top-left': '┌',
			'top-right': '┐',
			bottom: '─',
			'bottom-mid': '┴',
			'bottom-left': '└',
			'bottom-right': '┘',
			left: '│',
			'left-mid': '├',
			mid: '─',
			'mid-mid': '┼',
			right: '│',
			'right-mid': '┤',
			middle: '│'
		}
	});

	// Add row to change table
	changeTable.push([
		stats.pair,
		formatChange(stats.changes['5m']),
		formatChange(stats.changes['30m']),
		formatChange(stats.changes['1h']),
		formatChange(stats.changes['12h']),
		formatChange(stats.changes['1d'])
	]);

	output += chalk.bold('Change\n');
	output += changeTable.toString() + '\n\n';

	// Live trades table
	const tradesTable = new Table({
		head: [
			'pair',
			'last',
			'side',
			'size',
			'coins bought',
			'coins sold',
			'buys',
			'sells'
		],
		style: {
			head: ['gray'],
			border: ['gray']
		},
		chars: {
			top: '─',
			'top-mid': '┬',
			'top-left': '┌',
			'top-right': '┐',
			bottom: '─',
			'bottom-mid': '┴',
			'bottom-left': '└',
			'bottom-right': '┘',
			left: '│',
			'left-mid': '├',
			mid: '─',
			'mid-mid': '┼',
			right: '│',
			'right-mid': '┤',
			middle: '│'
		}
	});

	// Add row to trades table
	tradesTable.push([
		stats.pair,
		formatPrice(stats.trades.last),
		stats.trades.side === 'buy' ? chalk.green('buy') : chalk.red('sell'),
		stats.trades.size,
		stats.trades.bought,
		stats.trades.sold,
		chalk.green(stats.trades.buys),
		chalk.red(stats.trades.sells)
	]);

	output += chalk.bold('Live trades & running totals\n');
	output += tradesTable.toString();

	return output;
}
