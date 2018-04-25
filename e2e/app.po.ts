import { browser, by, element } from 'protractor';

export class AppPage {
  public navigateTo() {
    return browser.get('/');
  }

  public getTitle() {
    return element(by.css('.home-chip')).getText();
  }
}
