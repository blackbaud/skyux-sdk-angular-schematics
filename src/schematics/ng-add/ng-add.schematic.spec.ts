import {
  SchematicTestRunner
} from '@angular-devkit/schematics/testing';

import path from 'path';

import {
  createTestApp
} from '../testing/scaffold';

const COLLECTION_PATH = path.resolve(__dirname, '../../../collection.json');

describe('ng-add.schematic', () => {
  let runner: SchematicTestRunner;

  beforeEach(() => {
    runner = new SchematicTestRunner('schematics', COLLECTION_PATH);
  });

  it('should update package.json', async () => {
    const app = await createTestApp(runner);
    await runner
      .runSchematicAsync('ng-add', { project: 'foobar' }, app)
      .toPromise();

    expect(runner.tasks.some(task => task.name === 'node-package')).toEqual(
      true,
      'Expected the schematic to setup a package install step.'
    );
  });

});
