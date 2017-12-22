import { AppPage } from './app.po';

describe('arlas-wui App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display ARLAS title', () => {
    page.navigateTo();
    expect(page.getTitle()).toContain('ARLAS');
  });
});
