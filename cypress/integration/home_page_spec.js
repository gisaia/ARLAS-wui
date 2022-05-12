describe('The Home Page', () => {
  it('successfully loads', () => {
    cy.visit('/');
    cy.wait(8000);
  });
});
