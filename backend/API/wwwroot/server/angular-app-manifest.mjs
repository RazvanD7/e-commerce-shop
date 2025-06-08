
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: undefined,
  entryPointToBrowserMapping: {
  "src/app/shop/shop.module.ts": [
    {
      "path": "/chunk-IX7MECLL.js",
      "dynamicImport": false
    }
  ],
  "src/app/basket/basket.module.ts": [
    {
      "path": "/chunk-WDAW5D76.js",
      "dynamicImport": false
    },
    {
      "path": "/chunk-NFY4UP5X.js",
      "dynamicImport": false
    }
  ],
  "src/app/account/account.module.ts": [
    {
      "path": "/chunk-UNWDGOC3.js",
      "dynamicImport": false
    },
    {
      "path": "/chunk-6ZAJ5SDL.js",
      "dynamicImport": false
    }
  ],
  "src/app/checkout/checkout.module.ts": [
    {
      "path": "/chunk-XNSRLYJM.js",
      "dynamicImport": false
    },
    {
      "path": "/chunk-NFY4UP5X.js",
      "dynamicImport": false
    },
    {
      "path": "/chunk-6ZAJ5SDL.js",
      "dynamicImport": false
    }
  ],
  "src/app/orders/orders.module.ts": [
    {
      "path": "/chunk-E7D2PHAS.js",
      "dynamicImport": false
    }
  ]
},
  assets: {
    'index.csr.html': {size: 25961, hash: '7a95bdac279d877c920df3507c819fd655997503a9de6e812a4e49e7ec527037', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1422, hash: '10b14f75c2227a3b03f9b79de0ea72592d5ad3919149779e00b8354c793f103e', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-BEJAXIFO.css': {size: 527273, hash: 'J7sOra9lyYA', text: () => import('./assets-chunks/styles-BEJAXIFO_css.mjs').then(m => m.default)}
  },
};
