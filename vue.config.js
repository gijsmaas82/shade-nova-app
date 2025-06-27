const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,

  pwa: {
    name: 'S.H.A.D.E. Initiatie',
    themeColor: '#000000',
    backgroundColor: '#000000',
    display: 'standalone',
    orientation: 'portrait',
    start_url: '.',
    manifestOptions: {
      short_name: 'SHADE',
      description: 'Een geheim genootschap test je digitale skills',
      icons: [
        {
          src: './img/icons/web-app-manifest-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: './img/icons/web-app-manifest-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    // Optioneel: eigen service-worker gedrag aanpassen
    // workboxOptions: {
    //   skipWaiting: true,
    //   clientsClaim: true
    // }
  }
});
