import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';

import { __emitAppStateChange, __resetAppStateMock } from 'react-native';

import { AudioService } from '../AudioService.ts';
import { TimerService } from '../TimerService.ts';
import { useAudioStore } from '../../../domain/stores/audioStore.ts';

const originalDateNow = Date.now;
const originalFadeOut = AudioService.fadeOut;
const originalStop = AudioService.stop;

function flushMicrotasks() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

beforeEach(() => {
  useAudioStore.getState().reset();
  TimerService.stop();
  TimerService.removeAppStateListener();
  __resetAppStateMock();
  AudioService.fadeOut = originalFadeOut;
  AudioService.stop = originalStop;
});

afterEach(() => {
  Date.now = originalDateNow;
  useAudioStore.getState().reset();
  TimerService.stop();
  TimerService.removeAppStateListener();
  __resetAppStateMock();
  AudioService.fadeOut = originalFadeOut;
  AudioService.stop = originalStop;
});

test('expiry only runs once and clears playback after fade and stop', async () => {
  let nowMs = 1_000;
  let releaseFadeOut;
  let fadeOutCalls = 0;
  let stopCalls = 0;

  Date.now = () => nowMs;
  AudioService.fadeOut = async () => {
    fadeOutCalls += 1;
    await new Promise((resolve) => {
      releaseFadeOut = resolve;
    });
  };
  AudioService.stop = async () => {
    stopCalls += 1;
  };

  useAudioStore.getState().setCurrentSound('rain-01');
  useAudioStore.getState().setIsPlaying(true);
  TimerService.initAppStateListener();
  TimerService.startVerification(10_000);

  nowMs = 11_001;
  __emitAppStateChange('active');
  __emitAppStateChange('active');
  await flushMicrotasks();

  assert.equal(fadeOutCalls, 1);
  assert.equal(stopCalls, 0);

  releaseFadeOut();
  await flushMicrotasks();

  assert.equal(stopCalls, 1);
  assert.equal(useAudioStore.getState().currentSoundId, null);
  assert.equal(useAudioStore.getState().isPlaying, false);
  assert.equal(useAudioStore.getState().timerStartedAt, null);
});

test('foregrounding an expired timer triggers an immediate tick', async () => {
  let nowMs = 5_000;
  let fadeOutCalls = 0;
  let stopCalls = 0;

  Date.now = () => nowMs;
  AudioService.fadeOut = async () => {
    fadeOutCalls += 1;
  };
  AudioService.stop = async () => {
    stopCalls += 1;
  };

  useAudioStore.getState().setCurrentSound('rain-01');
  useAudioStore.getState().setIsPlaying(true);
  TimerService.start(60_000);
  TimerService.initAppStateListener();

  nowMs = 65_001;
  __emitAppStateChange('active');
  await flushMicrotasks();

  assert.equal(fadeOutCalls, 1);
  assert.equal(stopCalls, 1);
});

test('a new timer session is preserved if it starts during expiry handling', async () => {
  let nowMs = 1_000;
  let releaseFadeOut;
  let stopCalls = 0;

  Date.now = () => nowMs;
  AudioService.fadeOut = async () => {
    await new Promise((resolve) => {
      releaseFadeOut = resolve;
    });
  };
  AudioService.stop = async () => {
    stopCalls += 1;
  };

  useAudioStore.getState().setCurrentSound('rain-01');
  useAudioStore.getState().setIsPlaying(true);
  TimerService.initAppStateListener();
  TimerService.startVerification(10_000);

  nowMs = 11_001;
  __emitAppStateChange('active');
  await flushMicrotasks();

  nowMs = 20_000;
  useAudioStore.getState().setCurrentSound('ocean-01');
  useAudioStore.getState().setIsPlaying(true);
  TimerService.start(60_000);

  releaseFadeOut();
  await flushMicrotasks();

  const state = useAudioStore.getState();

  assert.equal(stopCalls, 0);
  assert.equal(state.currentSoundId, 'ocean-01');
  assert.equal(state.isPlaying, true);
  assert.notEqual(state.timerStartedAt, null);
  assert.equal(state.timerDurationMs, 60_000);
});

test('a store-driven timer restart is preserved if it happens during expiry handling', async () => {
  let nowMs = 1_000;
  let releaseFadeOut;
  let stopCalls = 0;

  Date.now = () => nowMs;
  AudioService.fadeOut = async () => {
    await new Promise((resolve) => {
      releaseFadeOut = resolve;
    });
  };
  AudioService.stop = async () => {
    stopCalls += 1;
  };

  useAudioStore.getState().setCurrentSound('rain-01');
  useAudioStore.getState().setIsPlaying(true);
  TimerService.initAppStateListener();
  TimerService.startVerification(10_000);

  nowMs = 11_001;
  __emitAppStateChange('active');
  await flushMicrotasks();

  nowMs = 20_000;
  useAudioStore.getState().setCurrentSound('ocean-01');
  useAudioStore.getState().setIsPlaying(true);
  useAudioStore.getState().setTimerDuration(60_000);

  releaseFadeOut();
  await flushMicrotasks();

  const state = useAudioStore.getState();

  assert.equal(stopCalls, 0);
  assert.equal(state.currentSoundId, 'ocean-01');
  assert.equal(state.isPlaying, true);
  assert.notEqual(state.timerStartedAt, null);
  assert.equal(state.timerDurationMs, 60_000);
});
