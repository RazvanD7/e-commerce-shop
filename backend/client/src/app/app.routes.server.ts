// server.routes.ts
import { inject } from '@angular/core';
import { RenderMode, ServerRoute } from '@angular/ssr';
import { ShopService } from './shop/shop.service';
import { OrdersService } from './orders/orders.service';

export const serverRoutes: ServerRoute[] = [
  // … static routes …

  {
  path: 'shop/:id',
  renderMode: RenderMode.Prerender,
  async getPrerenderParams(): Promise<Record<string,string>[]> {
    const svc = inject(ShopService);
    try {
      const ids = await svc.getAllProductIds();
      return ids.map(id => ({ id }));
    } catch {
      // If the HTTP request fails, skip prerender for dynamic IDs.
      return [];
    }
  }
},

  {
    path: 'orders/:id',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams(): Promise<Record<string, string>[]> {
      const svc = inject(OrdersService);
      const ids = await svc.getAllOrderIds();         // number[]
      return ids.map(id => ({ id: id.toString() }));
    }
  },

  { path: '**', renderMode: RenderMode.Server }
];
