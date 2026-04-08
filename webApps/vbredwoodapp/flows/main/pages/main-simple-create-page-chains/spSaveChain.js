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

      // Validate inputs (optional, if using oj-validation-group)
      try {
        const response = await Actions.callRest(context, {
          endpoint: 'EmployeeService/createEmployee',
          body: $page.variables.employeeVar
        }, { id: 'callRestCreate' });

        if (response.ok) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Success',
            message: 'Employee created successfully',
            type: 'confirmation',
            displayMode: 'transient'
          });

          // Reset variable and dirty flag
          await Actions.resetVariables(context, {
            variables: [
              '$page.variables.employeeVar',
              '$page.variables.dirtyDataFlag',
            ],
          });

          // Refresh the table
          await Actions.callChain(context, {
            chain: 'fetchEmployeeDataChain'
          });

          $page.variables.isSaved = true;
        } else {
          throw new Error(response.statusText || 'Failed to save employee');
        }
      } catch (err) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Save Error',
          message: err.message,
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return spSaveChain;
});
