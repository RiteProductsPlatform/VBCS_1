/* Copyright (c) 2025, Oracle and/or its affiliates */

define([
  'vb/action/actionChain',
  'vb/action/actions'
], (
  ActionChain,
  Actions
) => {
  'use strict';

  class fetchEmployeeDataChain extends ActionChain {

    /**
     * Fetch employee data from the REST service
     * @param {Object} context
     */
    async run(context) {
      const { $page } = context;

      try {
        const response = await Actions.callRest(context, {
          endpoint: 'EmployeeService/getEmployees',
        }, { id: 'callRestFetch' });

        if (response.ok) {
          // Assign to ADP data property directly to ensure reactivity
          $page.variables.employeeADP.data = response.body.items || [];
        } else {
          throw new Error(response.statusText || 'Unable to load employee list');
        }
      } catch (err) {
        // Only notify if not a standard JET abort
        if (err.name !== 'AbortError' && !err.message.includes('Aborting stale fetch')) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Fetch Error',
            message: 'Failed to fetch employees: ' + err.message,
            type: 'error',
            displayMode: 'transient'
          }, { id: 'fireFetchError' });
        }
      }
    }
  }

  return fetchEmployeeDataChain;
});
