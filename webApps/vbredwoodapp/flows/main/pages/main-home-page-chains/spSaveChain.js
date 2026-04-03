/* Copyright (c) 2025, Oracle and/or its affiliates */

define([
  'vb/action/actionChain',
  'vb/action/actions'
], (
  ActionChain,
  Actions
) => {
  'use strict';

  class spSaveChain extends ActionChain {

    /**
     * Submit form data
     * @param {Object} context
     */
    async run(context) {
      const { $page }  = context;

      if ($page.variables.formState === 'valid') {
        await Actions.callChain(context, {
          chain: '<id of the create/save action chain created by VB DT>',
        });

        // Reset dirty data
        await Actions.resetVariables(context, {
          variables: [
            '$page.variables.dirtyDataFlag',
          ],
        });

        $page.variables.isSaved = true;
      } else {
        await Actions.callComponentMethod(context, {
          selector: 'oj-dynamic-form',
          method: 'showMessages',
        });
        
      }
    }
  }

  return spSaveChain;
});
