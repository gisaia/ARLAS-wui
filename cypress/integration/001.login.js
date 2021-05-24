describe('Authentication', () => {
  it('Login', () => {
    cy.visit('https://demo.cloud.test.arlas.io/arlas/wui/')

    cy.wait(3000);
    // cy.get('.login').click();
    // cy.get('#username').type(Cypress.env('LOGIN'));
    // cy.get('#password').type(Cypress.env('PASSWORD'));
    // cy.get('button').click();

  })
})
