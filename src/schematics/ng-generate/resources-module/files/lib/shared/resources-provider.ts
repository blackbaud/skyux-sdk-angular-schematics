/**
 * DO NOT TOUCH!
 */
import {
  Injectable
} from '@angular/core';

import {
  getStringForLocale,
  SkyAppLocaleInfo,
  SkyLibResourcesProvider
} from '@skyux/i18n';

@Injectable()
export class <%= classify(name) %>ResourcesProvider implements SkyLibResourcesProvider {

  private resources: any = <%= resources %>;

  public getString(localeInfo: SkyAppLocaleInfo, name: string): string {
    return getStringForLocale(this.resources, localeInfo.locale, name);
  }

}
