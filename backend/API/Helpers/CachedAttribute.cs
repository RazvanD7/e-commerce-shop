using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace API.Helpers
{
    public class CachedAttribute : Attribute, IAsyncActionFilter
    {
        private readonly int _timeToLiveSeconds;
        private static readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true
        };

        public CachedAttribute(int timeToLiveSeconds)
        {
           _timeToLiveSeconds = timeToLiveSeconds;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var cacheService = context.HttpContext.RequestServices.GetRequiredService<IResponseCacheService>();
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<CachedAttribute>>();

            var cacheKey = GenerateCacheKeyFromRequest(context.HttpContext.Request);
            logger.LogInformation($"Checking cache for key: {cacheKey}");
            
            var cachedResponse = await cacheService.GetCachedResponseAsync(cacheKey);

            if(!string.IsNullOrEmpty(cachedResponse))
            {
                logger.LogInformation($"Cache hit for key: {cacheKey}");
                var contentResult = new ContentResult
                {
                    Content = cachedResponse,
                    ContentType = "application/json",
                    StatusCode = 200
                };
                context.Result = contentResult;
                return;
            }

            logger.LogInformation($"Cache miss for key: {cacheKey}");
            var executedContext = await next();

            if(executedContext.Result is OkObjectResult okObjectResult)
            {
                var response = JsonSerializer.Serialize(okObjectResult.Value, _jsonOptions);
                await cacheService.CacheResponseAsync(cacheKey, response, TimeSpan.FromSeconds(_timeToLiveSeconds));
                logger.LogInformation($"Cached response for key: {cacheKey}");
            }
        }

        private string GenerateCacheKeyFromRequest(HttpRequest request)
        {
            var keyBuilder = new StringBuilder();

            keyBuilder.Append($"{request.Path}");

            foreach(var(key,value) in request.Query.OrderBy(x => x.Key))
            {
                keyBuilder.Append($"|{key}-{value}");
            }

            return keyBuilder.ToString();
        }
    }
}
