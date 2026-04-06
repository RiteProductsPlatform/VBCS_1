/* Copyright (c) 2025, Oracle and/or its affiliates */

define([
  'vb/action/actionChain'
],  ActionChain  => {
  'use strict';

  class dialogResponseChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.detail 
     * @param {string} params.response 
     */
    async run(context, { response }) {
      const { $page } = context;

      // Close dialog
      $page.variables.dirtyDialogOpen = false;

      await $page.functions.userResponse(response);
    }
  }

  return dialogResponseChain;
});
