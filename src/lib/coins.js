import chalk from 'chalk';
import { fetchCoinList, fetchTopCoins } from '../api/api.js';
import Table from 'cli-table3';
import inquirer from 'inquirer';

/**
 * Lists all available coins
 * @returns {Promise<Array>} Array of formatted coin data
 */
export async function listCoins() {
	try {
		console.log(chalk.gray('Fetching available coins... \n'));
		const coins = await fetchCoinList();

		if (!coins || !Array.isArray(coins)) {
			throw new Error(
				'Invalid response from API: Expected an array of coins'
			);
		}

		const formattedCoins = coins
			.map(coin => {
				if (!coin || !coin.Symbol || !coin.CoinName) {
					console.warn(
						chalk.yellow(
							`Warning: Invalid coin data found, skipping: ${JSON.stringify(coin)}`
						)
					);
					return null;
				}
				return {
					id: coin.Symbol,
					symbol: coin.Symbol,
					name: coin.CoinName
				};
			})
			.filter(coin => coin !== null);

		if (formattedCoins.length === 0) {
			console.log(chalk.yellow('No valid coins found in the response'));
			return;
		}

		const itemsPerPage = 10;
		let currentPage = 0;
		const totalPages = Math.ceil(formattedCoins.length / itemsPerPage);

		const displayCoins = async page => {
			const table = new Table({
				head: [chalk.cyan('Symbol'), chalk.cyan('Name')],
				colWidths: [15, 40],
				style: {
					head: [],
					border: ['gray']
				}
			});

			const start = page * itemsPerPage;
			const end = Math.min(start + itemsPerPage, formattedCoins.length);
			const pageCoins = formattedCoins.slice(start, end);

			pageCoins.forEach(coin => {
				table.push([coin.symbol, coin.name]);
			});

			console.clear();
			console.log(table.toString());
			console.log(chalk.gray(`\nPage ${page + 1} of ${totalPages}`));

			const { action } = await inquirer.prompt([
				{
					type: 'list',
					name: 'action',
					message: 'Navigation:',
					choices: [
						...(page > 0 ? ['Previous Page'] : []),
						...(page < totalPages - 1 ? ['Next Page'] : []),
						'Exit'
					]
				}
			]);

			if (action === 'Previous Page') {
				await displayCoins(page - 1);
			} else if (action === 'Next Page') {
				await displayCoins(page + 1);
			} else if (action === 'Exit') {
				console.clear();
				return;
			}
		};

		await displayCoins(currentPage);
		return;
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

		if (!coins || !Array.isArray(coins)) {
			throw new Error(
				'Invalid response from API: Expected an array of coins'
			);
		}

		const formattedCoins = coins
			.map(item => {
				if (!item?.CoinInfo?.Name || !item?.CoinInfo?.FullName) {
					console.warn(
						chalk.yellow(
							`Warning: Invalid coin data found, skipping: ${JSON.stringify(item)}`
						)
					);
					return null;
				}
				return {
					symbol: item.CoinInfo.Name,
					name: item.CoinInfo.FullName,
					current_price: item.RAW?.USD?.PRICE || 0,
					market_cap: item.RAW?.USD?.MKTCAP || 0
				};
			})
			.filter(coin => coin !== null);

		if (formattedCoins.length === 0) {
			console.log(chalk.yellow('No valid coins found in the response'));
			return [];
		}

		if (limit > 1) {
			const table = new Table({
				head: [
					chalk.cyan('Rank'),
					chalk.cyan('Symbol'),
					chalk.cyan('Name'),
					chalk.cyan('Price (USD)'),
					chalk.cyan('Market Cap (USD)')
				],
				colWidths: [8, 12, 30, 15, 20],
				style: {
					head: [],
					border: ['gray']
				}
			});

			formattedCoins.forEach((coin, index) => {
				table.push([
					(index + 1).toString(),
					coin.symbol.toUpperCase(),
					coin.name,
					formatPrice(coin.current_price),
					formatMarketCap(coin.market_cap)
				]);
			});

			console.log(table.toString());
			console.log(
				chalk.gray(
					`\nShowing top ${formattedCoins.length} coins by market cap`
				)
			);
		}
		
		return formattedCoins;
	} catch (error) {
		console.error(chalk.red('Error fetching top coins:', error.message));
		process.exit(1);
	}
}

function formatPrice(price) {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(price);
}

function formatMarketCap(marketCap) {
	const formatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		notation: 'compact',
		maximumFractionDigits: 1
	});
	return formatter.format(marketCap);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { listCoins, getTopCoins };
}
