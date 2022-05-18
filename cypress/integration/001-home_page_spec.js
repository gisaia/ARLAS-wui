describe('The Home Page', () => {
  it('successfully loads', () => {
    // Visit is automatically prefixed with baseUrl
    cy.visit('/');
    // Sometime needed for DOM being ready
    cy.wait(5000);
    // remove gif
    cy.get('.gif').invoke('attr', 'style', 'display:none');
  });
});
