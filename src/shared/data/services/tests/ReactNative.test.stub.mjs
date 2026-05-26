const listeners = new Set();

export const AppState = {
  addEventListener(_eventType, listener) {
    listeners.add(listener);

    return {
      remove() {
        listeners.delete(listener);
      },
    };
  },
};

export function __emitAppStateChange(nextAppState) {
  for (const listener of [...listeners]) {
    listener(nextAppState);
  }
}

export function __resetAppStateMock() {
  listeners.clear();
}
