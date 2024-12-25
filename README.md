# Candlestick Trading Chart CLI

A command-line tool to view real-time trading charts directly in your terminal. Features include candlestick patterns, trend lines, and detailed statistics.

## Features

- 📊 Real-time candlestick charts with price action
- 📈 Dynamic trend line analysis
- 🎨 Colored visualization (bullish/bearish patterns)
- 📉 Technical statistics and volume data
- 🔍 Customizable time ranges and chart dimensions
- 📱 Support for multiple cryptocurrencies
- 💡 Easy-to-use command line interface

## Installation

```bash
# Clone the repository
git clone https://github.com/bittricky/candlestick.git
cd candlestick

# Install dependencies
pnpm install

# Link the package globally (optional)
pnpm link --global
```

## Usage

```bash
# Basic usage (shows BTC/USD for last 24 hours)
candlestick

# View specific cryptocurrency
candlestick -c ETH

# Customize time range
candlestick -c BTC --days 7
candlestick -c ETH --hours 4
candlestick -c BTC --mins 30

# Adjust chart dimensions
candlestick -w 150 -h 40

# View in different currency
candlestick -c BTC --currency EUR

# List available cryptocurrencies
candlestick -l

# Show top cryptocurrencies by market cap
candlestick -t 10
```

## Command Line Options

```
Options:
  -V, --version                         Output the version number
  -d, --days <n>                        Number of days to show
  --hours <n>                           Number of hours to show
  --mins <n>                            Number of minutes to show
  -w, --width <n>                       Max terminal chart width
  -h, --height <n>                      Max terminal chart height
  --max <n>                             Max y-axis value
  --min <n>                             Min y-axis value
  --min-range <n>                       Min range between min and max y-axis value
  -c, --coin <string>                   Specify the coin e.g. ETH (default: "BTC")
  --currency <string>                   Specify the trading pair currency (default: "USD")
  -l, --list                           List all available coins
  -t, --toplist <n>                    List of top n coins
  --disable-legend                      Disable legend text
  -h, --help                           Display help for command
```

## Chart Elements

The chart displays several key elements:

- 🟢 **Green Candlesticks**: Indicate price increase (bullish)
- 🔴 **Red Candlesticks**: Indicate price decrease (bearish)
- 📊 **Wicks**: Show high/low price ranges
- 📈 **Yellow Trend Line**: Shows overall price direction
- 📉 **Statistics**: Current price, high/low, volume, and trend information

## Data Source

This tool uses the CryptoCompare API to fetch real-time cryptocurrency data. No API key is required for basic usage.

## Requirements

- Node.js >= 14
- pnpm (recommended) or npm
- Terminal with color support

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/awesome-feature`)
3. Commit your changes (`git commit -am 'Add awesome feature'`)
4. Push to the branch (`git push origin feature/awesome-feature`)
5. Create a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Data provided by [CryptoCompare](https://www.cryptocompare.com/)
- Built with Node.js and chalk for terminal styling
- Inspired by traditional trading platforms
