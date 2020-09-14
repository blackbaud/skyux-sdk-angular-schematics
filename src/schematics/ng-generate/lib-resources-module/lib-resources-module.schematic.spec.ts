import {
  SchematicTestRunner,
  UnitTestTree
} from '@angular-devkit/schematics/testing';

import path from 'path';

import {
  getFileContents
} from '../../shared/get-file-contents';

import {
  createTestLibrary
} from '../../testing/scaffold';

const COLLECTION_PATH = path.resolve(__dirname, '../../../../collection.json');
const PROJECT_NAME = 'foobar';
const DEFAULT_RESOURCES_FILE = `/projects/${PROJECT_NAME}/src/assets/locales/resources_en_US.json`;
const RESOURCES_MODULE_FILE = `/projects/${PROJECT_NAME}/src/lib/shared/${PROJECT_NAME}-resources.module.ts`;
const PACKAGE_JSON_FILE = `projects/${PROJECT_NAME}/package.json`;

//#region helpers
function fileExists(tree: UnitTestTree, file: string): boolean {
  return (tree.files.indexOf(file) > -1);
}
//#endregion

describe('lib-resources-module.schematic', () => {
  let runner: SchematicTestRunner;
  let app: UnitTestTree;

  beforeEach(async () => {
    runner = new SchematicTestRunner('schematics', COLLECTION_PATH);
    app = await createTestLibrary(runner);

    // Create a default resources file.
    app.create(DEFAULT_RESOURCES_FILE, JSON.stringify({
      foobar: {
        _description: 'A simple message.',
        message: 'Hello, world!'
      }
    }));
  });

  it('should generate a resources module', async () => {
    const tree = await runner
      .runSchematicAsync('lib-resources-module', { project: PROJECT_NAME }, app)
      .toPromise();

    expect(fileExists(tree, RESOURCES_MODULE_FILE)).toEqual(
      true,
      'Expected files to include the resources module.'
    );

    expect(getFileContents(tree, RESOURCES_MODULE_FILE))
      .toContain('resources: any = {"EN-US":{"foobar":"Hello, world!"}};');
  });

  it('should create a default resources file if none exists', async () => {
    app.delete(DEFAULT_RESOURCES_FILE);

    const tree = await runner
      .runSchematicAsync('lib-resources-module', { project: PROJECT_NAME }, app)
      .toPromise();

    expect(fileExists(tree, DEFAULT_RESOURCES_FILE)).toEqual(
      true,
      'Expected files to include the default resources locale file.'
    );
  });

  it('should overwrite the local resources module if it exists', async () => {
    app.create(RESOURCES_MODULE_FILE, 'ORIGINAL CONTENT');

    const tree = await runner
      .runSchematicAsync('lib-resources-module', { project: PROJECT_NAME }, app)
      .toPromise();

    expect(getFileContents(tree, RESOURCES_MODULE_FILE)).not.toContain('ORIGINAL CONTENT');
  });

  it('should handle invalid project name', async () => {
    await expectAsync(
      runner
        .runSchematicAsync('lib-resources-module', { project: 'invalid-project' }, app)
        .toPromise()
    ).toBeRejectedWithError('The "invalid-project" project is not defined in angular.json. Provide a valid project name.');
  });

  it('should add `@skyux/i18n` as a peer dependency', async () => {
    // Overwrite package.json.
    app.overwrite(PACKAGE_JSON_FILE, '{}');

    const tree = await runner
      .runSchematicAsync('lib-resources-module', { project: PROJECT_NAME }, app)
      .toPromise();

    const packageJsonContents = JSON.parse(getFileContents(tree, PACKAGE_JSON_FILE));

    expect(packageJsonContents.peerDependencies['@skyux/i18n']).toEqual('^4.0.0');
  });

  it('should handle missing package.json file', async () => {
    app.delete(PACKAGE_JSON_FILE);

    await expectAsync(
      runner
        .runSchematicAsync('lib-resources-module', { project: PROJECT_NAME }, app)
        .toPromise()
    ).toBeRejectedWithError(`Cannot read "${PACKAGE_JSON_FILE}" because it does not exist.`);
  });
});
