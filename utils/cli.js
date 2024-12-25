import meowHelp from 'cli-meow-help';
import meow from 'meow';

const flags = {
	version: {
		type: 'boolean',
		shortFlag: 'V',
		desc: 'Output the version number'
	},
	days: {
		type: 'number',
		shortFlag: 'd',
		desc: 'Number of days the chart will go back'
	},
	hours: {
		type: 'number',
		desc: 'Number of hours the chart will go back'
	},
	mins: {
		type: 'number',
		desc: 'Number of minutes the chart will go back'
	},
	width: {
		type: 'number',
		shortFlag: 'w',
		desc: 'Max terminal chart width'
	},
	height: {
		type: 'number',
		shortFlag: 'h',
		desc: 'Max terminal chart height'
	},
	max: {
		type: 'number',
		desc: 'Max y-axis value'
	},
	min: {
		type: 'number',
		desc: 'Min y-axis value'
	},
	minRange: {
		type: 'number',
		desc: 'Min range between min and max y-axis value'
	},
	coin: {
		type: 'string',
		shortFlag: 'c',
		desc: 'Specify the coin e.g. ETH',
		default: 'BTC'
	},
	currency: {
		type: 'string',
		desc: 'Specify the trading pair currency',
		default: 'USD'
	},
	list: {
		type: 'boolean',
		shortFlag: 'l',
		desc: 'List all available coins'
	},
	toplist: {
		type: 'number',
		shortFlag: 't',
		desc: 'List of top n coins'
	},
	disableLegend: {
		type: 'boolean',
		desc: 'Disable legend text'
	},
	technicalIndicator: {
		type: 'string',
		isMultiple: true,
		shortFlag: 'ti',
		desc: 'Add a technical indicator: RSI SMA BB EMA MACD'
	},
	help: {
		type: 'boolean',
		shortFlag: 'h',
		desc: 'Display help for command'
	}
};

const commands = {
	help: { desc: 'Print help info' }
};

const helpText = meowHelp({
	name: 'candlestick',
	flags,
	commands
});

const options = {
	importMeta: import.meta,
	flags,
	description: 'A command line tool to view trading charts',
	help: helpText,
	autoHelp: true,
	autoVersion: true
};

export default meow(helpText, options);
