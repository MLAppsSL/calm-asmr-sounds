export async function resolve(specifier, context, defaultResolve) {
  if (specifier === 'expo-av') {
    return {
      shortCircuit: true,
      url: new URL('./AudioService.test.stub.mjs', import.meta.url).href,
    };
  }

  return defaultResolve(specifier, context, defaultResolve);
}
