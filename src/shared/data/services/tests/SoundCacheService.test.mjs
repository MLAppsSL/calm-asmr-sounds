import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';

import {
  __getFileSystemMockState,
  __resetFileSystemMock,
  __setDownloadHandler,
  __setExistingFile,
} from 'expo-file-system/legacy';
import {
  __getStorageMockState,
  __resetStorageMock,
  __setNextGetDownloadUrlError,
} from '@react-native-firebase/storage';

import { SOUNDS, SOUNDS_BY_CATEGORY, SOUNDS_BY_ID } from '../../catalogs/sounds.ts';
import { SoundCacheService } from '../SoundCacheService.ts';

const RAIN_SOUND = SOUNDS_BY_ID['rain-01'];
const LOCAL_RAIN_PATH = 'file:///documents/sounds/rain-01.mp3';

beforeEach(() => {
  __resetFileSystemMock();
  __resetStorageMock();
});

afterEach(() => {
  __resetFileSystemMock();
  __resetStorageMock();
});

test('catalog exports 9 sounds with lookup helpers', () => {
  assert.equal(SOUNDS.length, 9);
  assert.equal(SOUNDS_BY_ID['ocean-01'].title, 'Ocean Waves');
  assert.equal(SOUNDS_BY_CATEGORY.rain.length, 2);
  assert.equal(SOUNDS_BY_CATEGORY.fire.length, 2);
  assert.equal(SOUNDS_BY_CATEGORY.forest.length, 2);
  assert.equal(SOUNDS_BY_CATEGORY['white-noise'][0].storageRef, 'sounds/white-noise-01.mp3');

  for (const sound of SOUNDS) {
    assert.equal(sound.isPremium, false);
    assert.equal(sound.thumbnailUrl, null);
    assert.match(sound.storageRef, /^sounds\/.+\.mp3$/);
  }
});

test('cache hit returns immediately without storage or download work', async () => {
  __setExistingFile(LOCAL_RAIN_PATH);

  const localUri = await SoundCacheService.getLocalUri(RAIN_SOUND);

  assert.equal(localUri, LOCAL_RAIN_PATH);
  assert.deepEqual(__getStorageMockState().urlRequests, []);
  assert.deepEqual(__getFileSystemMockState().downloadCalls, []);
});

test('first download exposes loading state and deduplicates concurrent requests', async () => {
  let resolveDownload;
  const downloadReleased = new Promise((resolve) => {
    resolveDownload = resolve;
  });

  __setDownloadHandler(async () => {
    await downloadReleased;
    __setExistingFile(LOCAL_RAIN_PATH);

    return { status: 200, uri: LOCAL_RAIN_PATH };
  });

  const firstRequest = SoundCacheService.getLocalUri(RAIN_SOUND);
  const secondRequest = SoundCacheService.getLocalUri(RAIN_SOUND);

  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

  assert.equal(SoundCacheService.isLoading(RAIN_SOUND.id), true);

  resolveDownload();

  const [firstResult, secondResult] = await Promise.all([firstRequest, secondRequest]);

  assert.equal(firstResult, LOCAL_RAIN_PATH);
  assert.equal(secondResult, LOCAL_RAIN_PATH);
  assert.equal(SoundCacheService.isLoading(RAIN_SOUND.id), false);
  assert.equal(__getStorageMockState().urlRequests.length, 1);
  assert.equal(__getFileSystemMockState().downloadCalls.length, 1);
});

test('failed download cleans up partial file and returns null', async () => {
  __setDownloadHandler(async (_url, localPath, state) => {
    state.files.add(localPath);
    throw new Error('download failed');
  });

  const localUri = await SoundCacheService.getLocalUri(RAIN_SOUND);

  assert.equal(localUri, null);
  assert.deepEqual(__getFileSystemMockState().deleteCalls, [LOCAL_RAIN_PATH]);
  assert.equal(SoundCacheService.isLoading(RAIN_SOUND.id), false);
});

test('failed download URL resolution returns null without leaving a cached file', async () => {
  __setNextGetDownloadUrlError(new Error('denied'));

  const localUri = await SoundCacheService.getLocalUri(RAIN_SOUND);

  assert.equal(localUri, null);
  assert.equal(__getStorageMockState().urlRequests.length, 1);
  assert.equal(__getFileSystemMockState().files.has(LOCAL_RAIN_PATH), false);
});
