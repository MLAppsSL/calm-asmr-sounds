import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';

import { __getExpoAvMockState, __resetExpoAvMock, __setNextCreateError } from 'expo-av';

import { AudioService } from '../AudioService.ts';

async function settleWithTimeout(promise, timeoutMs = 250) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    }),
  ]);
}

beforeEach(async () => {
  await AudioService.stop();
  __resetExpoAvMock();
});

afterEach(async () => {
  await AudioService.stop();
  __resetExpoAvMock();
});

test('play starts a looping sound immediately', async () => {
  await AudioService.play('rain', 'file://rain.mp3');

  const state = __getExpoAvMockState();

  assert.equal(state.createCalls.length, 1);
  assert.deepEqual(state.createCalls[0], {
    initialStatus: {
      isLooping: true,
      progressUpdateIntervalMillis: 50,
      shouldPlay: true,
      volume: 1,
    },
    source: { uri: 'file://rain.mp3' },
  });
});

test('failed sound switch restores non-mixing audio mode and keeps the original sound active', async () => {
  await AudioService.play('rain', 'file://rain.mp3');

  const originalSound = __getExpoAvMockState().sounds[0];

  __setNextCreateError(new Error('create failed'));

  await assert.rejects(AudioService.play('waves', 'file://waves.mp3'), /create failed/);

  const state = __getExpoAvMockState();
  const audioModeCalls = state.audioModeCalls.map((mode) => mode.shouldDuckAndroid);

  assert.deepEqual(audioModeCalls.slice(-2), [true, false]);
  assert.equal(originalSound.unloadCalls, 0);

  await AudioService.fadeOut(0);

  assert.equal(originalSound.volume, 0);
});

test('fadeOut rejects frame errors instead of hanging', async () => {
  await AudioService.play('rain', 'file://rain.mp3');

  const sound = __getExpoAvMockState().sounds[0];

  sound.failNextSetVolume(new Error('volume failed'));

  await assert.rejects(settleWithTimeout(AudioService.fadeOut(100)), /volume failed/);

  await AudioService.stop();

  assert.equal(sound.unloadCalls, 1);
});

test('switching sounds preserves a fully faded outgoing volume', async () => {
  await AudioService.play('rain', 'file://rain.mp3');

  const originalSound = __getExpoAvMockState().sounds[0];

  await AudioService.fadeOut(0);
  await AudioService.play('waves', 'file://waves.mp3');

  assert.ok(originalSound.setVolumeCalls.every((volume) => volume === 0));
});

test('cancelled crossfade restores the outgoing sound volume', async () => {
  await AudioService.play('rain', 'file://rain.mp3');

  const originalSound = __getExpoAvMockState().sounds[0];

  await AudioService.fadeOut(0);

  const switchPromise = AudioService.play('waves', 'file://waves.mp3');

  await new Promise((resolve) => {
    setTimeout(resolve, 80);
  });

  await Promise.all([switchPromise, AudioService.fadeOut(1)]);

  const state = __getExpoAvMockState();
  const incomingSound = state.sounds[1];

  assert.equal(originalSound.volume, 0);
  assert.equal(originalSound.unloadCalls, 0);
  assert.equal(incomingSound.unloadCalls, 1);
});
