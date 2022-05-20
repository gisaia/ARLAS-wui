// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

beforeEach(() => {

  // Visit is automatically prefixed with baseUrl
  cy.visit('/');

  // Sometime needed for DOM being ready
  cy.wait(3500);

  // remove gif
  cy.get('.gif', {timeout: 5000}).invoke('attr', 'style', 'display:none');

  // get('.hopscotch-bubble-close') => get the DOM element with css class "arlas-search-container"
  // click() => click on the selected element
  cy.get('.hopscotch-bubble-close').click();

});

afterEach(() => {});

