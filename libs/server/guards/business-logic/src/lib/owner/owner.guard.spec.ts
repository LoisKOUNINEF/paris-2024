it.todo('fix tests');

// import { ExecutionContext } from '@nestjs/common';
// import { ModuleRef, Reflector } from '@nestjs/core';
// import { OwnerGuard } from './owner.guard';

// describe('OwnerGuard', () => {
//   let ownerGuard: OwnerGuard;
//   let reflector: Reflector;
//   let moduleRef: ModuleRef;

//   beforeEach(() => {
//     reflector = { get: jest.fn() } as any;
//     ownerGuard = new OwnerGuard(reflector, moduleRef);
//   });

//   it('should allow access if ownerCheck is false', () => {
//     (reflector.get as jest.Mock).mockReturnValue(false);

//     const context = createMockExecutionContext({});
//     expect(ownerGuard.canActivate(context)).toBe(true);
//   });

//   it('should deny access if request.user is missing', () => {
//     (reflector.get as jest.Mock).mockReturnValue(true);

//     const context = createMockExecutionContext({ user: null });
//     expect(ownerGuard.canActivate(context)).toBe(false);
//   });

//   it('should allow access if request.user is admin', () => {
//     (reflector.get as jest.Mock).mockReturnValue(true);

//     const context = createMockExecutionContext({
//       user: { role: 'admin', id: 1 },
//       query: { user: { id: 2 } },
//     });

//     expect(ownerGuard.canActivate(context)).toBe(true);
//   });

//   it('should allow access if request.user is the owner', () => {
//     (reflector.get as jest.Mock).mockReturnValue(true);

//     const context = createMockExecutionContext({
//       user: { role: 'user', id: 2 },
//       query: { user: { id: 2 } },
//     });

//     expect(ownerGuard.canActivate(context)).toBe(true);
//   });

//   it('should deny access if request.user is not the owner', () => {
//     (reflector.get as jest.Mock).mockReturnValue(true);

//     const context = createMockExecutionContext({
//       user: { role: 'user', id: 1 },
//       query: { user: { id: 2 } },
//     });

//     expect(ownerGuard.canActivate(context)).toBe(false);
//   });

//   function createMockExecutionContext(request: any): ExecutionContext {
//     return {
//       switchToHttp: () => ({
//         getRequest: () => request,
//       }),
//       getHandler: jest.fn(),
//       getClass: jest.fn(),
//     } as any as ExecutionContext;
//   }
// });
