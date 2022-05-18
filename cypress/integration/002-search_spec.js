describe('Filter search', () => {
  it('Check count value', () => {

    // get('.hopscotch-bubble-close') => get the DOM element with css class "arlas-search-container"
    // click() => click on the selected element
    cy.get('.hopscotch-bubble-close').click();
    // Access search input
    // get('.arlas-search-container') => get the DOM element with css class "arlas-search-container"
    // find('input') => get the first DOM element of type "input" inside the previous selector
    // type('France') => Type text "France" into the selected input element
    cy.get('.arlas-search-container').find('input').type('France');
    cy.wait(2000);
    // .get('.search-option') => Get one or more DOM elements with css class "search-option"
    // first() => Get the first DOM element within the set of DOM elements previously selected
    // click() => click on this element
    cy.get('.search-option').first().click();
    cy.wait(2000);
    // assert the value
    cy.get('#arlas-count .value').should(elem => {
      expect(elem.text().trim()).to.equal('32 772');
    });
  });
});
