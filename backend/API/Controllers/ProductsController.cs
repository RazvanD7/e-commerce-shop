﻿using Infrastructure.Data;
using Core.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Core.Interfaces;
using Core.Specifications;
using API.Dtos;
using AutoMapper;
using API.Errors;
using API.Helpers;

namespace API.Controllers
{
    public class ProductsController: BaseApiController
    {
        private readonly IGenericRepository<Product> _productsRepo;
        private readonly IGenericRepository<ProductBand> _productBrandRepo;
        private readonly IGenericRepository<ProductType> _productTypeRepo;
        private readonly IMapper _mapper;

        public ProductsController(IGenericRepository<Product> productsRepo, IGenericRepository<ProductBand> productBrandRepo, IGenericRepository<ProductType> productTypeRepo, IMapper mapper)
        {
            _productsRepo = productsRepo;
            _productBrandRepo = productBrandRepo;
            _productTypeRepo = productTypeRepo;
            _mapper = mapper;
        }
        [Cached(60)]
        [HttpGet]
        public async Task<ActionResult<API.Helpers.Pagination<ProductToReturnDto>>> GetProducts(
            string? sort, int? bandId, int? typeId, string? search, int pageIndex = 1, int pageSize = 12)
        {
            var skip = pageSize * (pageIndex - 1);
            var spec = new ProductsWithTypesAndBandsSpecification(sort, bandId, typeId, search, skip, pageSize);
            var countSpec = new ProductsWithTypesAndBandsForCountSpecification(bandId, typeId, search);

            var totalItems = (await _productsRepo.ListAsync(countSpec)).Count;
            var products = await _productsRepo.ListAsync(spec);

            var data = _mapper.Map<IReadOnlyList<Product>, IReadOnlyList<ProductToReturnDto>>(products);

            return Ok(new API.Helpers.Pagination<ProductToReturnDto>(pageIndex, pageSize, totalItems, data));
        }
        [Cached(60)]
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ProductToReturnDto>> GetProduct(int id)
        {
            var spec = new ProductsWithTypesAndBandsSpecification(id);

           var product = await _productsRepo.GetEntityWithSpec(spec);

            if (product == null) return NotFound(new ApiResponse(404));

            return _mapper.Map<Product, ProductToReturnDto>(product);

        }
        [Cached(60)]
        [HttpGet("bands")]
        public async Task<ActionResult<IReadOnlyList<ProductBand>>> GetProductBands()
        {
            return Ok(await _productBrandRepo.ListAllAsync());
        }
        [Cached(60)]
        [HttpGet("types")]
        public async Task<ActionResult<IReadOnlyList<ProductType>>> GetProductTypes()
        {
            return Ok(await _productTypeRepo.ListAllAsync());
        }

        [Cached(60)]
        [HttpGet("ids")]
        public async Task<ActionResult<int[]>> GetProductIds()
        {
            var products = await _productsRepo.ListAllAsync();
            var ids = products.Select(p => p.Id).ToArray();
            return Ok(ids);
        }
    }
}
