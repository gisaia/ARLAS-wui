describe('Filter', () => {
  it('Apply a filter', () => {
    cy.visit('https://demo.cloud.test.arlas.io/arlas/wui/?config_id=BTMiQbSE78H1nDKd1RWC')
    cy.wait(3000);
    cy.get('.hopscotch-close').click();
    cy.get('.arlas-search-container').find('input').type('219')
    cy.wait(2000);
    cy.get('.search-option').first().click();
    cy.get('.filter-count').contains('3 788');

  });

  it('Zoom to data', () => {
    cy.get('.arlas-zoom-to-data').click();
    cy.wait(7000);
  });

})
