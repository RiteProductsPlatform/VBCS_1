/* Copyright (c) 2025, Oracle and/or its affiliates */

define([
  'vb/action/actionChain',
  'vb/action/actions'
], (
  ActionChain,
  Actions
) => {
  'use strict';

  class goToParent extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {

      // Go to parent
      await Actions.navigateToPage(context, {
        page: '/',
      }, { id: 'goToParent' });
    }
  }

  return goToParent;
});
