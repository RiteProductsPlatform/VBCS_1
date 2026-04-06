/* Copyright (c) 2025, Oracle and/or its affiliates */

define([
  'vb/action/actionChain'
], ActionChain => {
  'use strict';

  class dynamicFormTransientValueChangeChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.detail 
     */
    async run(context, { detail }) {
      const { $page } = context;

      $page.variables.dirtyDataFlag = detail.previousValue === undefined || Object.keys(detail.previousValue).length === 0 ? false : true;
    }
  }

  return dynamicFormTransientValueChangeChain;
});
