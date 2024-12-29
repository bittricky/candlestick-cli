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
        const formattedCoins = coins.map(coin => ({
            id: coin.Symbol,
            symbol: coin.Symbol,
            name: coin.CoinName
        }));

        const itemsPerPage = 10;
        let currentPage = 0;
        const totalPages = Math.ceil(formattedCoins.length / itemsPerPage);

        const displayCoins = async (page) => {
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
            }
        };

        await displayCoins(currentPage);
        return formattedCoins;
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
