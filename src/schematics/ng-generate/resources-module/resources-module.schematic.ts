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

// import {
//   addModuleImportToModule,
//   buildComponent,
//   findModuleFromOptions,
// } from '@angular/cdk/schematics';

function getLocaleFiles(options: any): string[] {
  return glob.sync(
    path.join(options.path, 'assets/locales', 'resources_*.json')
  );
}

function getLocaleIDFromFileName(fileName: string): string {
  let locale = fileName.split('.json')[0].split('resources_')[1];
  locale = locale.toUpperCase().replace('_', '-');
  return locale;
}

/**
 * Fixes an Angular CLI issue with merge strategies.
 * @see https://github.com/angular/angular-cli/issues/11337#issuecomment-516543220
 */
function overwriteIfExists(host: Tree): Rule {
  return forEach(fileEntry => {
    if (host.exists(fileEntry.path)) {
      host.overwrite(fileEntry.path, fileEntry.content);
      return null;
    }
    return fileEntry;
  });
}

interface Resources {
  [localeId: string]: {
    [_: string]: {
      message: string;
    }
  }
}

export function generateResourcesModule(options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const workspace = getWorkspace(tree);
    const project = workspace.projects[options.project];

    options.path = path.join(path.normalize(project.root), 'src');
    options.name = options.project;

    const resources: Resources = {};

    const resourceFilesContents: any = {};
    const localeFiles = getLocaleFiles(options);
    localeFiles.forEach(file => {
      const locale = getLocaleIDFromFileName(file);
      const contents = fs.readJsonSync(file);
      resourceFilesContents[locale] = contents;
    });

    /**
     * Standardize keys to be uppercase, due to some language limitations
     * with lowercase characters.
     * See: https://stackoverflow.com/questions/234591/upper-vs-lower-case
     */
    const resourceFilesExist = ('EN-US' in resourceFilesContents);
    if (!resourceFilesExist) {
      return tree;
    }

    Object.keys(resourceFilesContents).forEach((locale) => {
      resources[locale] = {};
      Object.keys(resourceFilesContents[locale]).forEach((key) => {
        resources[locale][key] = resourceFilesContents[locale][key].message;
      });
    });

    options.resources = JSON.stringify(resources);

    const movePath = path.normalize(options.path + '/');

    const templateSource = apply(
      url('./files'),
      [
        applyTemplates({
          ...strings,
          ...options
        }),
        move(movePath),
        overwriteIfExists(tree)
      ]
    );

    return chain([
      mergeWith(templateSource, MergeStrategy.Overwrite)
    ]);
  };
}
