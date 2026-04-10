/* Copyright (c) 2025, Oracle and/or its affiliates */

define([
  'vb/action/actionChain',
  'vb/action/actions'
], (
  ActionChain,
  Actions
) => {
  'use strict';

  class spCancelChain extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {

      await Actions.navigateBack(context, {
      });
    }
  }

  return spCancelChain;
});
