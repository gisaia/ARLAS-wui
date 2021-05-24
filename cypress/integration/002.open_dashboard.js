describe('Open dashboard', () => {
  it('Choose a dashboard', () => {
    cy.visit('https://demo.cloud.test.arlas.io/arlas/wui/')
    cy.wait(3000);
    cy.get('.config').first().click({force: true});
    cy.get('.home-chip--label').contains('AIS Flow');
    cy.get('.hopscotch-close').click();
  });

  it('Check count', () => {
    cy.get('.filter-count').contains('557 750');
  })
})
