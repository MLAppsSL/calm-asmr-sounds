function unsupportedFirebaseModule() {
  throw new Error('Firebase test stub was called without being overridden in the test.');
}

export const analytics = unsupportedFirebaseModule;
export const auth = unsupportedFirebaseModule;
export const storage = unsupportedFirebaseModule;
export const firestore = unsupportedFirebaseModule;
