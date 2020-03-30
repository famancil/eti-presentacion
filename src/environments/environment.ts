// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  /*apiEndpoint: 'http://192.168.0.14:8080/api',
  clientEndpoint: 'http://192.168.0.14:4200',
  listenEndpoint: 'http://192.168.0.14:8080/api'*/
  apiEndpoint: 'http://localhost:8080/api',
  clientEndpoint: 'http://localhost:4200',
  listenEndpoint: 'http://172.16.1.3:8081/api'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
