import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchCoinList, fetchTopCoins, fetchCandleData } from '../api/api.js';
import axios from 'axios';

vi.mock('axios');

describe('API Functions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Mock console.error to avoid polluting test output
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	describe('fetchCoinList', () => {
		it('should fetch coin list successfully', async () => {
			const mockResponse = {
				data: {
					Response: 'Success',
					Data: {
						BTC: { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
						ETH: { id: 'ethereum', symbol: 'eth', name: 'Ethereum' }
					}
				}
			};
			vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

			const result = await fetchCoinList({});
			expect(result).toEqual([
				{ id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
				{ id: 'ethereum', symbol: 'eth', name: 'Ethereum' }
			]);
			expect(axios.get).toHaveBeenCalledWith(
				'https://min-api.cryptocompare.com/data/all/coinlist',
				{}
			);
		});

		it('should handle API errors', async () => {
			const mockResponse = {
				data: {
					Response: 'Error',
					Message: 'API error'
				}
			};
			vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

			await expect(fetchCoinList()).rejects.toThrow('API error');
		});

		it('should handle network errors', async () => {
			const error = new Error('Network error');
			vi.mocked(axios.get).mockRejectedValueOnce(error);

			await expect(fetchCoinList()).rejects.toThrow('Network error');
		});
	});

	describe('fetchTopCoins', () => {
		it('should fetch top coins successfully', async () => {
			const mockResponse = {
				data: {
					Response: 'Success',
					Data: [
						{
							CoinInfo: {
								Id: 'bitcoin',
								Name: 'BTC',
								FullName: 'Bitcoin'
							},
							RAW: {
								USD: {
									PRICE: 45000,
									MKTCAP: 800000000000
								}
							}
						}
					]
				}
			};
			vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

			const result = await fetchTopCoins(1);
			expect(result).toEqual(mockResponse.data.Data);
			expect(axios.get).toHaveBeenCalledWith(
				'https://min-api.cryptocompare.com/data/top/mktcapfull',
				{ params: { limit: 1, tsym: 'USD' } }
			);
		});

		it('should handle API errors', async () => {
			const mockResponse = {
				data: {
					Response: 'Error',
					Message: 'API error'
				}
			};
			vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

			await expect(fetchTopCoins(1)).rejects.toThrow('API error');
		});

		it('should handle network errors', async () => {
			const error = new Error('Network error');
			vi.mocked(axios.get).mockRejectedValueOnce(error);

			await expect(fetchTopCoins(1)).rejects.toThrow('Network error');
		});
	});

	describe('fetchCandleData', () => {
		it('should fetch candle data successfully', async () => {
			const mockResponse = {
				data: {
					Response: 'Success',
					Data: [
						{
							time: 1640995200,
							open: 46000,
							high: 47000,
							low: 45000,
							close: 46500,
							volumefrom: 1000000
						}
					]
				}
			};
			vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

			const result = await fetchCandleData('BTC', 'USD', { mins: 60 });
			expect(result).toEqual(mockResponse.data.Data);
			expect(axios.get).toHaveBeenCalledWith(
				'https://min-api.cryptocompare.com/data/histominute',
				{ params: { fsym: 'BTC', tsym: 'USD', limit: 60 } }
			);
		});

		it('should handle API errors', async () => {
			const mockResponse = {
				data: {
					Response: 'Error',
					Message: 'API error'
				}
			};
			vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

			await expect(fetchCandleData('BTC', 'USD')).rejects.toThrow(
				'API error'
			);
		});

		it('should handle network errors', async () => {
			const error = new Error('Network error');
			vi.mocked(axios.get).mockRejectedValueOnce(error);

			await expect(fetchCandleData('BTC', 'USD')).rejects.toThrow(
				'Network error'
			);
		});
	});
});
