import { readFile } from 'node:fs/promises';

import ts from 'typescript';

export async function resolve(specifier, context, defaultResolve) {
  if (specifier === 'react-native') {
    return {
      shortCircuit: true,
      url: new URL('./ReactNative.test.stub.mjs', import.meta.url).href,
    };
  }

  if (specifier === 'expo-av') {
    return {
      shortCircuit: true,
      url: new URL('./AudioService.audio-stub.mjs', import.meta.url).href,
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

  if (specifier.startsWith('@/')) {
    const aliasedPath = specifier.includes('.') ? specifier.slice(2) : `${specifier.slice(2)}.ts`;

    return defaultResolve(
      new URL(`../../../../${aliasedPath}`, import.meta.url).href,
      context,
      defaultResolve,
    );
  }

  if ((specifier.startsWith('./') || specifier.startsWith('../')) && !specifier.match(/\.[a-z]+$/i)) {
    try {
      return await defaultResolve(specifier, context, defaultResolve);
    } catch (error) {
      return defaultResolve(`${specifier}.ts`, context, defaultResolve);
    }
  }

  return defaultResolve(specifier, context, defaultResolve);
}

export async function load(url, context, defaultLoad) {
  if (url.endsWith('.ts')) {
    const source = await readFile(new URL(url), 'utf8');
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2020,
      },
      fileName: url,
    });

    return {
      format: 'module',
      shortCircuit: true,
      source: outputText,
    };
  }

  return defaultLoad(url, context, defaultLoad);
}
