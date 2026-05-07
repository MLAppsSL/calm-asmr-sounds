const fs = require('fs');
const { createRunOncePlugin, IOSConfig, withDangerousMod } = require('expo/config-plugins');

const pkg = {
  name: 'with-rnfb-non-modular-ios',
  version: '1.0.0',
};

const PATCH_LINE =
  '      config.build_settings["CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES"] = "YES"';

function patchPodfile(contents) {
  if (contents.includes('CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES')) {
    return contents;
  }

  const postInstallBlock = /post_install do \|installer\|\n/;
  if (!postInstallBlock.test(contents)) {
    throw new Error('Could not find post_install block in ios/Podfile');
  }

  return contents.replace(
    postInstallBlock,
    `post_install do |installer|\n  installer.pods_project.targets.each do |target|\n    target.build_configurations.each do |config|\n${PATCH_LINE}\n    end\n  end\n`,
  );
}

const withRnfbNonModularIos = (config) =>
  withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = IOSConfig.Paths.getPodfilePath(config.modRequest.projectRoot);
      const podfile = fs.readFileSync(podfilePath, 'utf8');
      fs.writeFileSync(podfilePath, patchPodfile(podfile));
      return config;
    },
  ]);

module.exports = createRunOncePlugin(withRnfbNonModularIos, pkg.name, pkg.version);
