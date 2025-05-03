using API.Dtos;
using AutoMapper;
using Core.Entities;
using Microsoft.Extensions.Configuration;

namespace API.Helpers
{
    public class ProductUrlResolver : IValueResolver<Product, ProductToReturnDto, string>
    {
        private readonly IConfiguration _conifg;

        public ProductUrlResolver(Microsoft.Extensions.Configuration.IConfiguration conifg)
        {
            _conifg = conifg;
        }

        public string Resolve(Product source, ProductToReturnDto destination, string destMember, ResolutionContext context)
        {
            if(!string.IsNullOrEmpty(source.PictureUrl))
            {
                return _conifg["ApiUrl"] + source.PictureUrl;
            }

            return null;
        }
    }
}
