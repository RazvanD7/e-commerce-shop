using Core.Entities;
using Core.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Stripe;
using Core.Entities.OrderAggregate;
using Product = Core.Entities.Product;

namespace Infrastructure.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IBasketRepository _basketRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _config;

        public PaymentService(IBasketRepository basketRepository, IUnitOfWork unitOfWork, IConfiguration config)
        {
            _basketRepository = basketRepository;
            _unitOfWork = unitOfWork;
            _config = config;
        }

        public async Task<CustomerBasket> CreateOrUpdatePaymentIntent(string baskertId)
        {
            StripeConfiguration.ApiKey = _config["StripeSettings:SecretKey"];

            var basket = await _basketRepository.GetBasketAsync(baskertId);
            var shippingPrice = 0m;

            if(basket.DeliveryMethodId.HasValue)
            {
                var deliveryMethod = await _unitOfWork.Repository<DeliveryMethod>().GetByIdAsync((int)basket.DeliveryMethodId);
                shippingPrice = deliveryMethod.Price;
            }

            foreach(var item in basket.Items)
            {
                var productItem = await _unitOfWork.Repository<Product>().GetByIdAsync(item.Id);
                if(item.Price != productItem.Price)
                {
                    item.Price = productItem.Price;
                }
            }
            var service = new PaymentIntentService();

            PaymentIntent intent;

            if(string.IsNullOrEmpty(basket.PaymentIntentId))
            {
                var options = new PaymentIntentCreateOptions
                {
                    Amount = (long)basket.Items.Sum(i => i.Quantity * (i.Price * 100)) + (long)shippingPrice * 100,
                    Currency = "usd",
                    PaymentMethodTypes = new List<string> { "card" }
                };
                intent = await service.CreateAsync(options);
                basket.PaymentIntentId = intent.Id;
                basket.ClientSecret = intent.ClientSecret;
            }
            else
            {
                try
                {
                    intent = await service.GetAsync(basket.PaymentIntentId);
                    
                    // If the PaymentIntent has already succeeded, create a new basket
                    if (intent.Status == "succeeded")
                    {
                        // Create a new basket with the same items
                        var newBasket = new CustomerBasket(baskertId);
                        newBasket.Items = basket.Items;
                        newBasket.DeliveryMethodId = basket.DeliveryMethodId;
                        
                        // Create a new PaymentIntent for the new basket
                        var options = new PaymentIntentCreateOptions
                        {
                            Amount = (long)newBasket.Items.Sum(i => i.Quantity * (i.Price * 100)) + (long)shippingPrice * 100,
                            Currency = "usd",
                            PaymentMethodTypes = new List<string> { "card" }
                        };
                        intent = await service.CreateAsync(options);
                        newBasket.PaymentIntentId = intent.Id;
                        newBasket.ClientSecret = intent.ClientSecret;
                        
                        // Update the basket in the repository
                        await _basketRepository.UpdateBasketAsync(newBasket);
                        return newBasket;
                    }
                    else
                    {
                        var options = new PaymentIntentUpdateOptions
                        { 
                            Amount = (long)basket.Items.Sum(i => i.Quantity * (i.Price * 100)) + (long)shippingPrice * 100 
                        };
                        await service.UpdateAsync(basket.PaymentIntentId, options);
                    }
                }
                catch (StripeException ex)
                {
                    // If there's any error with the existing PaymentIntent, create a new one
                    var options = new PaymentIntentCreateOptions
                    {
                        Amount = (long)basket.Items.Sum(i => i.Quantity * (i.Price * 100)) + (long)shippingPrice * 100,
                        Currency = "usd",
                        PaymentMethodTypes = new List<string> { "card" }
                    };
                    intent = await service.CreateAsync(options);
                    basket.PaymentIntentId = intent.Id;
                    basket.ClientSecret = intent.ClientSecret;
                }
            }
            await _basketRepository.UpdateBasketAsync(basket);

            return basket;
        }
    }
}
