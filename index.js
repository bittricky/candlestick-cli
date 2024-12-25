#!/usr/bin/env node

/**
 * candlestick
 * Command line tool to view trading charts from your terminal
 *
 * @author Mitul Patel <https://mitulpa.tel>
 */

import cli from './utils/cli.js';
import { fetchCryptoData, renderChart, listCoins, getTopCoins } from './utils/chart.js';

const { flags } = cli;

(async () => {
    try {
        if (flags.list) {
            const coins = await listCoins();
            console.log('Available coins:');
            coins.forEach(coin => console.log(`${coin.symbol.toUpperCase()} - ${coin.name}`));
            process.exit(0);
        }

        if (flags.toplist) {
            const topCoins = await getTopCoins(flags.toplist);
            console.log(`Top ${flags.toplist} coins by market cap:`);
            topCoins.forEach(coin => {
                console.log(`${coin.symbol.toUpperCase()} - ${coin.name} - $${coin.current_price}`);
            });
            process.exit(0);
        }

        const timeframe = {
            days: flags.days,
            hours: flags.hours,
            mins: flags.mins
        };

        // Default to 24 hours if no timeframe specified
        if (!timeframe.days && !timeframe.hours && !timeframe.mins) {
            timeframe.hours = 24;
        }

        const data = await fetchCryptoData(flags.coin, flags.currency, timeframe);
        
        const chartOptions = {
            width: flags.width,
            height: flags.height,
            max: flags.max,
            min: flags.min,
            disableLegend: flags.disableLegend
        };

        const chart = await renderChart(data, chartOptions);
        console.log(chart);

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
})();
