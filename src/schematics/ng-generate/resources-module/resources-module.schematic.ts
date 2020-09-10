import {
  apply,
  // FileEntry,
  forEach,
  // MergeStrategy,
  mergeWith,
  // move,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
  move,
  // FileEntry,
  MergeStrategy
} from '@angular-devkit/schematics';
// import { strings } from '@angular-devkit/core';

import path from 'path';
import { getWorkspace } from '@schematics/angular/utility/config';
import { strings } from '@angular-devkit/core';

// import {
//   addModuleImportToModule,
//   buildComponent,
//   findModuleFromOptions,
// } from '@angular/cdk/schematics';

/**
 * Fixes an Angular CLI issue with merge strategies.
 * @see https://github.com/angular/angular-cli/issues/11337#issuecomment-516543220
 */
export function overwriteIfExists(host: Tree): Rule {
  return forEach(fileEntry => {
    if (host.exists(fileEntry.path)) {
      host.overwrite(fileEntry.path, fileEntry.content);
      return null;
    }
    return fileEntry;
  });
}

export function generateResourcesModule(options: any): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const workspace = getWorkspace(tree);
    const project = workspace.projects[options.project];

    options.path = path.join(path.normalize(project.root), 'src');
    options.name = options.project;
    options.resources = JSON.stringify({
      'EN-US': {}
    }).replace(/'/g, '\'').replace(/"/g, '\'').replace(/:{/g, ': {');

    const movePath = path.normalize(options.path + '/');

    const templateSource = apply(
      url('./files'),
      [
        template({ ...strings, ...options }),
        move(movePath),
        overwriteIfExists(tree)
      ]
    );
    const rule = mergeWith(templateSource, MergeStrategy.Overwrite);
    return rule(tree, context);
  };
}
