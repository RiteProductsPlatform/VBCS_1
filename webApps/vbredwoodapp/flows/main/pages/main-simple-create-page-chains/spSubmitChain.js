/* Copyright (c) 2025, Oracle and/or its affiliates */

define([
  'vb/action/actionChain',
  'vb/action/actions'
], (
  ActionChain,
  Actions
) => {
  'use strict';

  class spSubmitChain extends ActionChain {

    /**
     * Notify primary action is triggered
     * @param {Object} context
     */
    async run(context) {

      // Call save chain
      await Actions.callChain(context, {
        chain: 'spSaveChain',
      }, { id: 'callSaveChain' });

      // Navigate to page
      await Actions.navigateToPage(context, {
        page: '/',
      }, { id: 'navigateToPage' });
    }
  }

  return spSubmitChain;
});
