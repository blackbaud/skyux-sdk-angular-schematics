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
  Tree,
  url
} from '@angular-devkit/schematics';

import {
  getWorkspace
} from '@schematics/angular/utility/config';

import fs from 'fs-extra';
import glob from 'glob';
import path from 'path';

import {
  InputOptions
} from './input-options';

import {
  ResourceMessages
} from './resource-messages';

import {
  TemplateContext
} from './template-context';

function getResourceFilesContents(srcPath: string) {
  const contents: any = {};
  const files = glob.sync(
    path.join(srcPath, 'assets/locales/resources_*.json')
  );

  files.forEach(file => {
    const locale = parseLocaleIdFromFileName(file);
    contents[locale] = fs.readJsonSync(file);
  });

  return contents;
}

function parseLocaleIdFromFileName(fileName: string): string {
  return fileName
    .split('.json')[0]
    .split('resources_')[1]
    .toUpperCase()
    .replace('_', '-');
}

function parseResourceMessages(srcPath: string): ResourceMessages {
  const messages: ResourceMessages = {};
  const contents = getResourceFilesContents(srcPath);

  /**
   * Standardize keys to be uppercase, due to some language limitations
   * with lowercase characters.
   * See: https://stackoverflow.com/questions/234591/upper-vs-lower-case
   */
  const resourceFilesExist = ('EN-US' in contents);
  if (!resourceFilesExist) {
    return messages;
  }

  Object.keys(contents).forEach(locale => {
    messages[locale] = {};
    Object.keys(contents[locale]).forEach(key => {
      messages[locale][key] = contents[locale][key].message;
    });
  });

  return messages;
}

function ensureDefaultResourceFileExists(srcPath: string) {
  const defaultResourcePath = path.join(`${srcPath}/assets/locales/resources_en_US.json`);
  if (fs.existsSync(defaultResourcePath)) {
    return;
  }

  fs.writeJsonSync(
    defaultResourcePath,
    {
      hello_world: {
        _description: 'A simple message.',
        message: 'Hello, world!'
      }
    },
    {
      spaces: 2
    }
  );
}

/**
 * Adds `@skyux/i18n` to the project's package.json `peerDependencies`.
 */
function addSkyUxPeerDependency(tree: Tree, rootPath: string) {
  const packageJsonPath = path.join(rootPath, 'package.json');
  const packageJsonContent = tree.read(packageJsonPath)!;
  const packageJson = JSON.parse(packageJsonContent.toString());
  packageJson.peerDependencies = packageJson.peerDependencies || {};
  packageJson.peerDependencies['@skyux/i18n'] = '^4.0.0';
  tree.overwrite(packageJsonPath, JSON.stringify(packageJson, undefined, 2));
}

/**
 * Fixes an Angular CLI issue with merge strategies.
 * @see https://github.com/angular/angular-cli/issues/11337#issuecomment-516543220
 */
function overwriteIfExists(host: Tree): Rule {
  return forEach(fileEntry => {
    if (host.exists(fileEntry.path) && fileEntry) {
      host.overwrite(fileEntry.path, fileEntry.content);
      return null;
    }
    return fileEntry;
  });
}

export function generateResourcesModule(options: InputOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {

    const workspace = getWorkspace(tree);
    const project = workspace.projects[options.project];
    const srcPath = path.join(path.normalize(project.root), 'src');
    const movePath = path.normalize(srcPath + '/');

    addSkyUxPeerDependency(tree, project.root);

    ensureDefaultResourceFileExists(srcPath);
    const messages = parseResourceMessages(srcPath);
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

    return chain([
      mergeWith(templateSource, MergeStrategy.Overwrite)
    ]);
  };
}
