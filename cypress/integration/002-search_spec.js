describe('Filter search', () => {
  it('Check count value', () => {

    // Access search input
    // get('.arlas-search-container') => get the DOM element with css class "arlas-search-container"
    // find('input') => get the first DOM element of type "input" inside the previous selector
    // type('France') => Type text "France" into the selected input element
    cy.intercept(
      'http://localhost:9999/arlas/explore/demo_eo/_aggregate?agg=term%3Ainternal.autocomplete*',
      {
        'elements': [
          { 'count': 25000, 'key': 'France', 'key_as_string': 'France' },
          { 'count': 20000, 'key': 'France 2', 'key_as_string': 'France 2' }
        ]
      }
    ).as('getSearch');

    // autocomplete field is throttled
    // meaning it only makes a request after
    // 300ms from the last keyPress
    cy.get('.arlas-search-container').find('input').type('France');

    // wait for the request + response
    // thus insulating us from the throttled request
    cy.wait('@getSearch');

    cy.get('.search-option')
      .should('contain', 'France')
      .and('contain', 'France 2');

    // .get('.search-option') => Get one or more DOM elements with css class "search-option"
    // first() => Get the first DOM element within the set of DOM elements previously selected
    // click() => click on this element
    cy.get('.search-option').first().click();
    cy.wait(2000);

    // assert the value
    cy.get('#arlas-count .value').should(elem => {
      expect(elem.text().trim()).to.equal('25 000');
    });
  });
});
