import {
  Rule,
  SchematicContext,
  Tree
} from '@angular-devkit/schematics';

import {
  NodePackageInstallTask
} from '@angular-devkit/schematics/tasks';

export function ngAdd(): Rule {
  return (_tree: Tree, context: SchematicContext) => {
    // Install as a development dependency.
    context.addTask(new NodePackageInstallTask());
  };
}
