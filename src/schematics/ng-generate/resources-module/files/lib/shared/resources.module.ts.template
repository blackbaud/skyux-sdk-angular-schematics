import {
  NgModule
} from '@angular/core';

import {
  SkyI18nModule,
  SKY_LIB_RESOURCES_PROVIDERS
} from '@skyux/i18n';

import {
  <%= classify(name) %>ResourcesProvider
} from './resources-provider';

@NgModule({
  exports: [
    SkyI18nModule
  ],
  providers: [
    {
      provide: SKY_LIB_RESOURCES_PROVIDERS,
      useClass: <%= classify(name) %>ResourcesProvider,
      multi: true
    }
  ]
})
export class <%= classify(name) %>ResourcesModule { }
