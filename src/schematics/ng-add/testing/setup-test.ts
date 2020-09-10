import rewiremock from 'rewiremock';

export function MockNodePackageInstallTask(): void {}

export function setupTest(): void {

  rewiremock('@angular-devkit/schematics').with({}).dynamic();

  rewiremock('@angular-devkit/schematics/tasks').with({
    'NodePackageInstallTask': MockNodePackageInstallTask
  }).dynamic();

  rewiremock.enable();
}

export function teardownTest(): void {
  rewiremock.disable();
}

export function resetMock(name: string, value: any): void {
  rewiremock.getMock(name).with(value);
}
