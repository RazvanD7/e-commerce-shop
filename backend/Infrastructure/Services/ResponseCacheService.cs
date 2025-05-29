using Core.Interfaces;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services
{
    public class ResponseCacheService : IResponseCacheService
    {
        private readonly IDatabase _database;
        private readonly ILogger<ResponseCacheService> _logger;
        private static readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true
        };

        public ResponseCacheService(IConnectionMultiplexer redis, ILogger<ResponseCacheService> logger)
        {
            _database = redis.GetDatabase();
            _logger = logger;
        }

        public async Task CacheResponseAsync(string cacheKey, object response, TimeSpan timeToLive)
        {
            if(response == null)
            {
                _logger.LogWarning($"Attempted to cache null response for key: {cacheKey}");
                return;
            }

            try
            {
                // If response is already a string, use it directly
                if (response is string stringResponse)
                {
                    await _database.StringSetAsync(cacheKey, stringResponse, timeToLive);
                    _logger.LogInformation($"Cached string response for key: {cacheKey}");
                    return;
                }

                var serialisedResponse = JsonSerializer.Serialize(response, _jsonOptions);
                await _database.StringSetAsync(cacheKey, serialisedResponse, timeToLive);
                _logger.LogInformation($"Cached serialized response for key: {cacheKey}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error caching response for key: {cacheKey}");
            }
        }

        public async Task<string> GetCachedResponseAsync(string cacheKey)
        {
            try
            {
                var cachedResponse = await _database.StringGetAsync(cacheKey);
                if(cachedResponse.IsNullOrEmpty)
                {
                    _logger.LogInformation($"No cached response found for key: {cacheKey}");
                    return null;
                }
                _logger.LogInformation($"Retrieved cached response for key: {cacheKey}");
                return cachedResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving cached response for key: {cacheKey}");
                return null;
            }
        }
    }
}
