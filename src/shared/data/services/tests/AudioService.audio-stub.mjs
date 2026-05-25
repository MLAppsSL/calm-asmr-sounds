const state = {
  audioModeCalls: [],
  createCalls: [],
  nextCreateError: null,
  sounds: [],
};

let nextSoundId = 1;

class MockSound {
  constructor(uri, volume) {
    this.id = nextSoundId++;
    this.uri = uri;
    this.volume = volume;
    this.setVolumeCalls = [];
    this.stopCalls = 0;
    this.unloadCalls = 0;
    this.nextSetVolumeError = null;
  }

  failNextSetVolume(error) {
    this.nextSetVolumeError = error;
  }

  async setVolumeAsync(volume) {
    if (this.nextSetVolumeError) {
      const error = this.nextSetVolumeError;
      this.nextSetVolumeError = null;
      throw error;
    }

    this.volume = volume;
    this.setVolumeCalls.push(volume);
  }

  async stopAsync() {
    this.stopCalls += 1;
  }

  async unloadAsync() {
    this.unloadCalls += 1;
  }
}

export const InterruptionModeAndroid = {
  DoNotMix: 'DO_NOT_MIX',
  DuckOthers: 'DUCK_OTHERS',
};

export const InterruptionModeIOS = {
  DoNotMix: 'DO_NOT_MIX',
  MixWithOthers: 'MIX_WITH_OTHERS',
};

export const Audio = {
  Sound: {
    async createAsync(source, initialStatus) {
      state.createCalls.push({ initialStatus, source });

      if (state.nextCreateError) {
        const error = state.nextCreateError;
        state.nextCreateError = null;
        throw error;
      }

      const sound = new MockSound(source.uri, initialStatus.volume ?? 1);
      state.sounds.push(sound);

      return { sound };
    },
  },
  async setAudioModeAsync(mode) {
    state.audioModeCalls.push(mode);
  },
};

export function __getExpoAvMockState() {
  return state;
}

export function __resetExpoAvMock() {
  state.audioModeCalls = [];
  state.createCalls = [];
  state.nextCreateError = null;
  state.sounds = [];
  nextSoundId = 1;
}

export function __setNextCreateError(error) {
  state.nextCreateError = error;
}
