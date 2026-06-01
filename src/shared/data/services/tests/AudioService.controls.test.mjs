import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';

import { __getExpoAvMockState, __resetExpoAvMock } from 'expo-av';

import { AudioService } from '../AudioService.ts';

const state = __getExpoAvMockState();

beforeEach(async () => {
  await AudioService.stop();
  __resetExpoAvMock();
  AudioService.setPlaybackStatusListener(null);
});

afterEach(async () => {
  await AudioService.stop();
  __resetExpoAvMock();
  AudioService.setPlaybackStatusListener(null);
});

test('pause does nothing and does not throw if no sound is active', async () => {
  await assert.doesNotReject(async () => {
    await AudioService.pause();
  });
});

test('pause calls pauseAsync on the active sound instance', async () => {
  await AudioService.play('ambient_rain', 'file://rain.mp3');

  const activeSound = state.sounds[0];

  activeSound.pauseAsync = async function () {
    this.pausedCalled = true;
  };

  await AudioService.pause();

  assert.equal(activeSound.pausedCalled, true);
});

test('resume returns false immediately if there is no active sound to resume', async () => {
  const result = await AudioService.resume();

  assert.equal(result, false);
});

test('resume returns true and triggers playAsync if an active sound exists', async () => {
  await AudioService.play('ambient_rain', 'file://rain.mp3');

  const activeSound = state.sounds[0];
  let playAsyncCalled = false;

  activeSound.playAsync = async function () {
    playAsyncCalled = true;
  };

  const result = await AudioService.resume();

  assert.equal(result, true);
  assert.equal(playAsyncCalled, true);
});

test('setLooping propagates the looping state to all active sound instances', async () => {
  await AudioService.play('ambient_rain', 'file://rain.mp3');

  const activeSound = state.sounds[0];

  activeSound.setIsLoopingAsync = async function (looping) {
    this.loopedWith = looping;
  };

  await AudioService.setLooping(true);

  assert.equal(activeSound.loopedWith, true);

  await AudioService.setLooping(false);

  assert.equal(activeSound.loopedWith, false);
});

test('setPlaybackStatusListener successfully receives status updates from active sound updates', async () => {
  let receivedStatus = null;

  AudioService.setPlaybackStatusListener((status) => {
    receivedStatus = status;
  });

  await AudioService.play('ambient_rain', 'file://rain.mp3');

  const activeSound = state.sounds[0];
  const mockNativeStatus = {
    isLoaded: true,
    didJustFinish: false,
    durationMillis: 60000,
    isLooping: true,
    isPlaying: true,
    positionMillis: 15000,
  };

  AudioService['handlePlaybackStatus'](activeSound, mockNativeStatus);

  assert.notEqual(receivedStatus, null);
  assert.equal(receivedStatus.isPlaying, true);
  assert.equal(receivedStatus.positionMillis, 15000);
  assert.equal(receivedStatus.isLooping, true);
});

test('setPlaybackStatusListener(null) clears the emitter and ignores downstream events', async () => {
  let callCount = 0;

  AudioService.setPlaybackStatusListener(() => {
    callCount += 1;
  });

  await AudioService.play('ambient_rain', 'file://rain.mp3');

  const activeSound = state.sounds[0];

  AudioService['handlePlaybackStatus'](activeSound, {
    isLoaded: true,
    didJustFinish: false,
    durationMillis: 60000,
    isLooping: false,
    isPlaying: true,
    positionMillis: 1000,
  });

  assert.equal(callCount, 1);

  AudioService.setPlaybackStatusListener(null);

  AudioService['handlePlaybackStatus'](activeSound, {
    isLoaded: true,
    didJustFinish: false,
    durationMillis: 60000,
    isLooping: false,
    isPlaying: true,
    positionMillis: 2000,
  });

  assert.equal(callCount, 1);
});

test('stop automatically broadcasts null to active status listeners', async () => {
  let lastEmittedStatus = undefined;

  await AudioService.play('ambient_rain', 'file://rain.mp3');

  AudioService.setPlaybackStatusListener((status) => {
    lastEmittedStatus = status;
  });

  await AudioService.stop();

  assert.equal(lastEmittedStatus, null);
});
