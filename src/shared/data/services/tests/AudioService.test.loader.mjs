export async function resolve(specifier, context, defaultResolve) {
  if (specifier === 'expo-av') {
    return {
      shortCircuit: true,
      url: new URL('./AudioService.test.stub.mjs', import.meta.url).href,
    };
  }

  if (specifier === 'expo-file-system/legacy') {
    return {
      shortCircuit: true,
      url: new URL('./FileSystem.test.stub.mjs', import.meta.url).href,
    };
  }

  if (specifier === '@react-native-firebase/storage') {
    return {
      shortCircuit: true,
      url: new URL('./Storage.test.stub.mjs', import.meta.url).href,
    };
  }

  return defaultResolve(specifier, context, defaultResolve);
}
