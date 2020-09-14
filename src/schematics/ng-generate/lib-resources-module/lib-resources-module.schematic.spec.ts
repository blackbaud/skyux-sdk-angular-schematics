import {
  SchematicTestRunner
} from '@angular-devkit/schematics/testing';

import path from 'path';

import {
  createTestLibrary
} from '../../testing/scaffold';

const COLLECTION_PATH = path.resolve(__dirname, '../../../../collection.json');
const PROJECT_NAME = 'foobar';

describe('lib-resources-module.schematic', () => {
  let runner: SchematicTestRunner;

  beforeEach(() => {
    runner = new SchematicTestRunner('schematics', COLLECTION_PATH);
  });

  it('should generate a resources module', async () => {
    const app = await createTestLibrary(runner);
    const tree = await runner
      .runSchematicAsync('lib-resources-module', { project: PROJECT_NAME }, app)
      .toPromise();

    expect(
      tree.files.indexOf(`/projects/${PROJECT_NAME}/src/lib/shared/${PROJECT_NAME}-resources.module.ts`) > -1
    ).toBeTrue();
  });

  it('should create a default resources file if none exists', async () => {
    const app = await createTestLibrary(runner);
    const tree = await runner
      .runSchematicAsync('lib-resources-module', { project: PROJECT_NAME }, app)
      .toPromise();

    expect(
      tree.files.indexOf(`/projects/${PROJECT_NAME}/src/assets/locales/resources_en_US.json`) > -1
    ).toBeTrue();
  });
});
