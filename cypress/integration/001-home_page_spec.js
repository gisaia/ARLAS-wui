describe('The Home Page', () => {
  it('successfully loads', () => {
    cy.get('.home-chip--label').contains('ARLAS');
  });
});
