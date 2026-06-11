const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');
const backendRoot = path.join(workspaceRoot, 'packages', 'backend');
const designRoot = path.join(workspaceRoot, 'packages', 'design');
const config = getDefaultConfig(projectRoot);
const defaultResolveRequest = config.resolver.resolveRequest;
const appNodeModules = path.join(projectRoot, 'node_modules');
const packageAliases = {
  '@311-security/backend': backendRoot,
  '@311-security/design': designRoot,
  react: path.join(appNodeModules, 'react'),
  'react-dom': path.join(appNodeModules, 'react-dom'),
};

config.watchFolders = Array.from(
  new Set([...config.watchFolders, backendRoot, designRoot, workspaceRoot]),
);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@311-security/backend': backendRoot,
  '@311-security/design': designRoot,
  react: path.join(appNodeModules, 'react'),
  'react-dom': path.join(appNodeModules, 'react-dom'),
};

function resolveWithDefault(context, moduleName, platform) {
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
}

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'expo-router/_ctx') {
    return {
      filePath: path.join(projectRoot, 'router-context.js'),
      type: 'sourceFile',
    };
  }

  for (const [alias, targetPath] of Object.entries(packageAliases)) {
    if (moduleName === alias || moduleName.startsWith(`${alias}/`)) {
      const subPath = moduleName.slice(alias.length);
      return resolveWithDefault(context, `${targetPath}${subPath}`, platform);
    }
  }

  return resolveWithDefault(context, moduleName, platform);
};

module.exports = config;
