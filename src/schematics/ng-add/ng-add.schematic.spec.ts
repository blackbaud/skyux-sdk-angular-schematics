// import {
//   MockNodePackageInstallTask,
//   setupTest,
//   teardownTest
// } from './testing/setup-test';

// // Setup mocks before importing the file that will be tested.
// setupTest();

// import {
//   ngAdd
// } from './ng-add.schematic';

// describe('ngAdd schematic', () => {
//   let mockContext: any;

//   beforeEach(() => {
//     mockContext = {
//       addTask: jasmine.createSpy('addTask')
//     };
//   });

//   afterEach(() => {
//     teardownTest();
//   });

//   it('should add a node package install task', () => {
//     const rule = ngAdd();

//     rule({} as any, mockContext);

//     expect(mockContext.addTask).toHaveBeenCalledWith(jasmine.any(MockNodePackageInstallTask));
//   });

// });
