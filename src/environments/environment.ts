// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.ss
/** 
  base_url: 'https://admin.franciastore.com/api',
  base_url: 'https://admin.akieztupollo.com/api',
  base_url: 'https://admin.jdr127.com/api',
  base_url: 'https://tiendaschicco.simids.com.co/api',

  base_url: 'http://localhost:3000/api',
  base_url: 'http://192.168.1.150:3000/api',

  base_url: 'https://admin.castitoner.com/api',

  base_url: 'https://empanadasdelvalle.poslatino.com/api',

  base_url: 'https://demo.loggikpos.online/api',
  
*/


export const environment = {
  production: false,
  empresa:{
    name: 'simids',
    url: 'simids.com',
    phone: '573007325684'
  },
  base_url: 'http://localhost:3000/api',
  local_url: 'https://castitoner.com/api',
  dataico_url: 'https://api.dataico.com/dataico_api/v2'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLIi.
