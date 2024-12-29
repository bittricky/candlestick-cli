import { describe, it, expect, beforeEach, vi } from 'vitest';
import { listCoins, getTopCoins } from '../lib/coins.js';
import * as api from '../api/api.js';

vi.mock('../api/api.js', () => ({
	fetchCoinList: vi.fn(),
	fetchTopCoins: vi.fn()
}));

describe('Coin Functions', () => {
	beforeEach(() => {
		// Clear all mocks before each test
		vi.clearAllMocks();
		// Mock console methods
		global.console = {
			log: vi.fn(),
			error: vi.fn(),
			warn: vi.fn(),
			table: vi.fn()
		};
		// Mock process.exit
		vi.spyOn(process, 'exit').mockImplementation(() => {});
	});

	describe('listCoins', () => {
		it('should list coins successfully', async () => {
			const mockCoins = [
				{
					Symbol: 'BTC',
					CoinName: 'Bitcoin',
					FullName: 'Bitcoin (BTC)'
				},
				{
					Symbol: 'ETH',
					CoinName: 'Ethereum',
					FullName: 'Ethereum (ETH)'
				}
			];

			vi.mocked(api.fetchCoinList).mockResolvedValueOnce(mockCoins);

			await listCoins();

			expect(api.fetchCoinList).toHaveBeenCalled();
			expect(console.log).toHaveBeenCalledWith(
				expect.stringContaining('Fetching available coins...')
			);
		});

		it('should handle invalid coin data', async () => {
			const mockCoins = [
				{ invalid: 'data' },
				{
					Symbol: 'BTC',
					CoinName: 'Bitcoin',
					FullName: 'Bitcoin (BTC)'
				}
			];

			vi.mocked(api.fetchCoinList).mockResolvedValueOnce(mockCoins);

			await listCoins();

			expect(console.warn).toHaveBeenCalledWith(
				expect.stringContaining('Warning: Invalid coin data found')
			);
		});

		it('should handle errors when listing coins', async () => {
			const error = new Error('Failed to fetch coins');
			vi.mocked(api.fetchCoinList).mockRejectedValueOnce(error);

			await listCoins();

			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining('Error fetching coin list:')
			);
			expect(process.exit).toHaveBeenCalledWith(1);
		});
	});

	describe('getTopCoins', () => {
		it('should get top coins successfully', async () => {
			const mockTopCoins = [
				{
					CoinInfo: {
						Name: 'BTC',
						FullName: 'Bitcoin (BTC)'
					},
					RAW: {
						USD: {
							PRICE: 45000,
							MKTCAP: 800000000000,
							CHANGEPCT24HOUR: 2.5
						}
					}
				}
			];

			vi.mocked(api.fetchTopCoins).mockResolvedValueOnce(mockTopCoins);

			await getTopCoins(1);

			expect(api.fetchTopCoins).toHaveBeenCalledWith(1);
			expect(console.log).toHaveBeenCalledWith(
				expect.stringContaining('Fetching top coins...')
			);
		});

		it('should handle invalid coin data', async () => {
			const mockTopCoins = [
				{ invalid: 'data' },
				{
					CoinInfo: {
						Name: 'BTC',
						FullName: 'Bitcoin (BTC)'
					},
					RAW: {
						USD: {
							PRICE: 45000,
							MKTCAP: 800000000000
						}
					}
				}
			];

			vi.mocked(api.fetchTopCoins).mockResolvedValueOnce(mockTopCoins);

			await getTopCoins(2);

			expect(console.warn).toHaveBeenCalledWith(
				expect.stringContaining('Warning: Invalid coin data found')
			);
		});

		it('should handle errors when getting top coins', async () => {
			const error = new Error('Failed to fetch top coins');
			vi.mocked(api.fetchTopCoins).mockRejectedValueOnce(error);

			await getTopCoins(1);

			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining('Error fetching top coins:')
			);
			expect(process.exit).toHaveBeenCalledWith(1);
		});

		it('should use default limit when not provided', async () => {
			const mockTopCoins = [
				{
					CoinInfo: {
						Name: 'BTC',
						FullName: 'Bitcoin (BTC)'
					},
					RAW: {
						USD: {
							PRICE: 45000,
							MKTCAP: 800000000000
						}
					}
				}
			];

			vi.mocked(api.fetchTopCoins).mockResolvedValueOnce(mockTopCoins);

			await getTopCoins();

			expect(api.fetchTopCoins).toHaveBeenCalledWith(10); // Default limit
			expect(console.log).toHaveBeenCalledWith(
				expect.stringContaining('Fetching top coins...')
			);
		});
	});
});
