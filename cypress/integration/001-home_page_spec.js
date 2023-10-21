describe('The Home Page', () => {
  // Get one or more DOM elements with css class "home-chip--label"
  // verify it contains ‘ARLAS’ text


  it('successfully loads', () => {

    cy.wait('@list');
    cy.wait('@count');
    cy.get('.home-chip--label').contains('ARLAS');
  });

});
