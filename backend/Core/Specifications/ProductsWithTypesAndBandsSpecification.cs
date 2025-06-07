using Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Core.Specifications
{
    public class ProductsWithTypesAndBandsSpecification : BaseSpecification<Product>
    {
        public ProductsWithTypesAndBandsSpecification(string sort, int? brandId, int? typeId, string? search, int? skip = null, int? take = null) 
            : base(x => 
                (string.IsNullOrEmpty(search) || x.Name.ToLower().Contains(search.ToLower())) &&
                (!brandId.HasValue || x.ProductBandId == brandId) && (!typeId.HasValue || x.ProductTypeId == typeId)
            )
        {
            AddInclude(x => x.ProductType);
            AddInclude(x => x.Band);
            AddOrderBy(x => x.Name);

            if(!string.IsNullOrEmpty(sort))
            {
                switch (sort)
                {
                    case "priceAsc":
                        AddOrderBy(p => p.Price);
                        break;
                    case "priceDesc":
                        AddOrderByDescending(p => p.Price);
                        break;
                    default:
                        AddOrderBy(n => n.Name);
                        break;

                }

            }
            if (skip.HasValue && take.HasValue)
            {
                ApplyPaging(skip.Value, take.Value);
            }
        }

        public ProductsWithTypesAndBandsSpecification(int id) : base(x => x.Id == id)
        {
            AddInclude(x => x.ProductType);
            AddInclude(x => x.Band);
        }
    }

    public class ProductsWithTypesAndBandsForCountSpecification : BaseSpecification<Product>
    {
        public ProductsWithTypesAndBandsForCountSpecification(int? bandId, int? typeId, string? search)
            : base(x =>
                (string.IsNullOrEmpty(search) || x.Name.ToLower().Contains(search.ToLower())) &&
                (!bandId.HasValue || x.ProductBandId == bandId) && (!typeId.HasValue || x.ProductTypeId == typeId)
            )
        {
        }
    }
}
