# Candlestick

> Are you analyzing market trends or just trying to set the mood? Either way, here is the candlestick you need!

A command-line tool to view cryptocurrency trading charts directly in your terminal.

## Features

- 📈 Real-time candlestick charts in ASCII art
- 🪙 List all available cryptocurrencies
- 💹 View top cryptocurrencies by market cap
- 📊 Customizable chart timeframes (minutes, hours, days)
- 🎨 Color-coded output for better visualization

## Installation

```bash
# Install globally using npm
npm install -g candlestick

# Or using pnpm
pnpm add -g candlestick
```

## Usage

```bash
# View Bitcoin chart (defaults to USD and 24h timeframe)
candlestick -c BTC

# View Ethereum chart in EUR
candlestick -c ETH -r EUR

# Customize timeframe
candlestick -c BTC -d 7     # 7 days
candlestick -c BTC -H 4     # 4 hours
candlestick -c BTC -m 30    # 30 minutes

# Customize chart dimensions
candlestick -c BTC -w 100 -h 30

# List all available cryptocurrencies
candlestick -l

# View top N cryptocurrencies by market cap
candlestick -t 10

# Hide chart legend
candlestick -c BTC --disable-legend
```

## API

This tool uses the [CryptoCompare API - Free Tier](https://min-api.cryptocompare.com/) to fetch cryptocurrency data. The following endpoints being used:

- `/data/all/coinlist` - Get list of all available coins
- `/data/top/mktcapfull` - Get top coins by market cap
- `/data/histominute` - Get minute-level OHLCV data
- `/data/histohour` - Get hour-level OHLCV data
- `/data/histoday` - Get day-level OHLCV data

The free tier includes:

- 100,000 calls per month
- Rate limit of 50 calls/second
- Access to all basic price and market data

No API key is required for basic usage. If you need higher rate limits or additional features, you can sign up for an API key at [CryptoCompare](https://www.cryptocompare.com/cryptopian/api-keys).

## Development

### Prerequisites

- Node.js (v16 or higher)
- pnpm (recommended) or npm

### Setup

```bash
# Clone the repository
git clone https://github.com/bittricky/candlestick.git
cd candlestick

# Install dependencies
pnpm install

# Run tests
pnpm test

# Run the CLI in development
pnpm start chart BTC
```

### Project Structure

```
candlestick/
├── src/
│   ├── api/          # API integration
│   ├── lib/          # Core functionality
│   └── __tests__/    # Unit tests
├── index.js          # CLI entry point
└── package.json
```

### Running Tests

The project uses Vitest for testing. Run tests with:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test -- --watch
```

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Mitul Patel - [mitulpa.tel](https://mitulpa.tel)
