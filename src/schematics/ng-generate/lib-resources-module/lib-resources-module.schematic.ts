import {
  strings
} from '@angular-devkit/core';

import {
  apply,
  applyTemplates,
  chain,
  forEach,
  MergeStrategy,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
  url
} from '@angular-devkit/schematics';

import path from 'path';

import {
  getFileContents
} from '../../shared/get-file-contents';

import {
  InputOptions
} from './input-options';

import {
  ResourceMessages
} from './resource-messages';

import {
  TemplateContext
} from './template-context';

function getResourceFilesContents(tree: Tree, srcPath: string) {
  const contents: any = {};
  const dirEntry = tree.getDir(path.join(srcPath, 'assets/locales'));

  dirEntry.subfiles.map(subfile => path.join(srcPath, 'assets/locales', subfile)).forEach(file => {
    const locale = parseLocaleIdFromFileName(file);
    contents[locale] = JSON.parse(getFileContents(tree, file));
  });

  return contents;
}

/**
 * Standardize keys to be uppercase, due to some language limitations
 * with lowercase characters.
 * See: https://stackoverflow.com/questions/234591/upper-vs-lower-case
 */
function parseLocaleIdFromFileName(fileName: string): string {
  return fileName
    .split('.json')[0]
    .split('resources_')[1]
    .toUpperCase()
    .replace('_', '-');
}

function parseResourceMessages(tree: Tree, srcPath: string): ResourceMessages {
  const messages: ResourceMessages = {};
  const contents = getResourceFilesContents(tree, srcPath);

  Object.keys(contents).forEach(locale => {
    messages[locale] = {};
    Object.keys(contents[locale]).forEach(key => {
      messages[locale][key] = contents[locale][key].message;
    });
  });

  return messages;
}

/**
 * Adds `@skyux/i18n` to the project's package.json `peerDependencies`.
 */
function addI18nPeerDependency(tree: Tree, srcPath: string): void {
  const packageJsonPath = path.join(srcPath.replace('src', ''), 'package.json');
  const packageJsonContent = getFileContents(tree, packageJsonPath);
  const packageJson = JSON.parse(packageJsonContent);
  packageJson.peerDependencies = packageJson.peerDependencies || {};
  packageJson.peerDependencies['@skyux/i18n'] = '^4.0.0';
  tree.overwrite(packageJsonPath, JSON.stringify(packageJson, undefined, 2));
}

/**
 * Fixes an Angular CLI issue with merge strategies.
 * @see https://github.com/angular/angular-cli/issues/11337#issuecomment-516543220
 */
function overwriteIfExists(tree: Tree): Rule {
  return forEach(fileEntry => {
    if (tree.exists(fileEntry.path)) {
      tree.overwrite(fileEntry.path, fileEntry.content);
      return null;
    }
    return fileEntry;
  });
}

function getProjectSourcePath(tree: Tree, options: InputOptions): string {

  // Get the workspace config.
  const workspaceConfigBuffer = tree.read('angular.json');
  if (!workspaceConfigBuffer) {
    throw new SchematicsException('Not an Angular CLI workspace.');
  }
  const workspace = JSON.parse(workspaceConfigBuffer.toString());

  const project = workspace.projects[options.project];

  if (!project) {
    throw new Error(`The "${options.project}" project is not defined in angular.json. Provide a valid project name.`);
  }

  return path.join(path.normalize(project.root), 'src');
}

function ensureDefaultResourcesFileExists(options: InputOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const srcPath = getProjectSourcePath(tree, options);
    const defaultResourcePath = path.join(`${srcPath}/assets/locales/resources_en_US.json`);

    if (tree.exists(defaultResourcePath)) {
      return;
    }

    tree.create(defaultResourcePath, JSON.stringify({
      hello_world: {
        _description: 'A simple message.',
        message: 'Hello, world!'
      }
    }, undefined, 2) + '\n');

    return tree;
  }
}

export default function generateResourcesModule(options: InputOptions): Rule {
  return chain([

    ensureDefaultResourcesFileExists(options),

    (tree: Tree, _context: SchematicContext) => {
      const srcPath = getProjectSourcePath(tree, options);
      const movePath = path.normalize(srcPath + '/');

      addI18nPeerDependency(tree, srcPath);

      const messages = parseResourceMessages(tree, srcPath);
      const templateContext: TemplateContext = {
        name: options.project,
        resources: JSON.stringify(messages)
      };

      const templateConfig = { ...strings, ...templateContext };

      const templateSource = apply(url('./files'), [
        applyTemplates(templateConfig),
        move(movePath),
        overwriteIfExists(tree)
      ]);

      return mergeWith(templateSource, MergeStrategy.Overwrite);
    }
  ]);
}
