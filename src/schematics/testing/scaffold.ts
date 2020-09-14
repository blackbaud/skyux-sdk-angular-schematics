import {
  Tree
} from '@angular-devkit/schematics';

import {
  SchematicTestRunner,
  UnitTestTree
} from '@angular-devkit/schematics/testing';

async function createTestProject(
  runner: SchematicTestRunner,
  projectType: 'application' | 'library',
  appOptions = { },
  tree?: Tree
): Promise<UnitTestTree> {

  const workspaceTree = await runner.runExternalSchematicAsync(
    '@schematics/angular',
    'workspace',
    {
      name: 'workspace',
      version: '10.0.0',
      newProjectRoot: 'projects'
    },
    tree
  ).toPromise();

  return runner.runExternalSchematicAsync(
    '@schematics/angular',
    projectType,
    {
      name: 'foobar',
      ...appOptions
    },
    workspaceTree
  ).toPromise();
}

/**
 * Create a base app used for testing.
 */
export async function createTestApp(
  runner: SchematicTestRunner,
  appOptions = { },
  tree?: Tree
): Promise<UnitTestTree> {
  return createTestProject(runner, 'application', appOptions, tree);
}

/**
 * Create a base library used for testing.
 */
export async function createTestLibrary(
  runner: SchematicTestRunner,
  appOptions = {},
  tree?: Tree
): Promise<UnitTestTree> {
  return createTestProject(runner, 'library', appOptions, tree);
}
