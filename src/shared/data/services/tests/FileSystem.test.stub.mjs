const state = {
  directories: new Set(['file:///documents/']),
  downloadCalls: [],
  files: new Set(),
  getInfoCalls: [],
  makeDirectoryCalls: [],
  deleteCalls: [],
  downloadHandler: null,
};

export const documentDirectory = 'file:///documents/';

export async function getInfoAsync(path) {
  state.getInfoCalls.push(path);

  return {
    exists: state.directories.has(path) || state.files.has(path),
  };
}

export async function makeDirectoryAsync(path, options = {}) {
  state.makeDirectoryCalls.push({ options, path });
  state.directories.add(path);
}

export async function downloadAsync(url, localPath) {
  state.downloadCalls.push({ localPath, url });

  if (state.downloadHandler) {
    return state.downloadHandler(url, localPath, state);
  }

  state.files.add(localPath);

  return {
    status: 200,
    uri: localPath,
  };
}

export async function deleteAsync(path) {
  state.deleteCalls.push(path);
  state.files.delete(path);
}

export function __getFileSystemMockState() {
  return state;
}

export function __resetFileSystemMock() {
  state.directories = new Set([documentDirectory]);
  state.downloadCalls = [];
  state.files = new Set();
  state.getInfoCalls = [];
  state.makeDirectoryCalls = [];
  state.deleteCalls = [];
  state.downloadHandler = null;
}

export function __setDownloadHandler(handler) {
  state.downloadHandler = handler;
}

export function __setExistingFile(path) {
  state.files.add(path);
}
