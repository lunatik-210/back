import { types, flow } from 'mobx-state-tree';

import { Companies } from './company';

export const RootStore = types
  .model('RootStore', {
    companiesStore: types.optional(Companies, {}),
    isLoading: types.optional(types.boolean, false)
  })
  .actions(self => ({
    fetch: flow(function* (request) {
      let response;
      self.isLoading = true;
      try {
        response = yield request();
        self.isLoading = false;
        return response;
      } catch (error) {
        self.isLoading = false;
        throw error;
      }
    })
  }));
