const state = {
  nextGetDownloadUrlError: null,
  refCalls: [],
  urlRequests: [],
};

function storage() {
  return {
    ref(storageRef) {
      state.refCalls.push(storageRef);

      return {
        async getDownloadURL() {
          state.urlRequests.push(storageRef);

          if (state.nextGetDownloadUrlError) {
            const error = state.nextGetDownloadUrlError;
            state.nextGetDownloadUrlError = null;
            throw error;
          }

          return `https://storage.test/${storageRef}`;
        },
      };
    },
  };
}

export default storage;

export function __getStorageMockState() {
  return state;
}

export function __resetStorageMock() {
  state.nextGetDownloadUrlError = null;
  state.refCalls = [];
  state.urlRequests = [];
}

export function __setNextGetDownloadUrlError(error) {
  state.nextGetDownloadUrlError = error;
}
