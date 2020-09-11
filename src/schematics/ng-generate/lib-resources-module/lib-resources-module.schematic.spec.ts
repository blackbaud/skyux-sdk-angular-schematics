import {
  SchematicTestRunner
} from '@angular-devkit/schematics/testing';

import fs from 'fs-extra';
import path from 'path';

import {
  createTestLibrary
} from '../../testing/scaffold';

const COLLECTION_PATH = path.resolve(__dirname, '../../../../collection.json');

describe('lib-resources-module.schematic', () => {
  let runner: SchematicTestRunner;

  beforeEach(() => {
    runner = new SchematicTestRunner('schematics', COLLECTION_PATH);
    spyOn(fs, 'writeJsonSync').and.callFake(() => {});
  });

  it('should generate a resources module', async () => {
    const app = await createTestLibrary(runner);
    const tree = await runner
      .runSchematicAsync('lib-resources-module', { project: 'my-lib' }, app)
      .toPromise();

    expect(
      tree.files.indexOf('/projects/my-lib/src/lib/shared/my-lib-resources.module.ts') > -1
    ).toBeTrue();
  });

  it('should create a default resources file if none exists', async () => {
    const app = await createTestLibrary(runner);
    const tree = await runner
      .runSchematicAsync('lib-resources-module', { project: 'my-lib' }, app)
      .toPromise();

    expect(
      tree.files.indexOf('/projects/my-lib/src/assets/locales/resources_en_US.json') > -1
    ).toBeTrue();
  });
});
