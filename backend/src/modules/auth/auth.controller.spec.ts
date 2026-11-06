import type { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import type { AuthService } from './auth.service';

describe('AuthController', () => {
  const auth = { register: jest.fn(), login: jest.fn(), getProfile: jest.fn() };
  const users = { updateProfile: jest.fn() };
  const controller = new AuthController(
    auth as unknown as AuthService,
    users as unknown as UsersService,
  );
  const user = { id: 5, email: 'a@a.com', role: 'USER' as const };

  it('delega registro, login y perfil', () => {
    controller.register({ name: 'A', email: 'a@a.com', password: 'secreta' });
    controller.login({ email: 'a@a.com', password: 'secreta' });
    controller.me(user);
    controller.updateProfile(user, { phone: '999' });

    expect(auth.register).toHaveBeenCalled();
    expect(auth.login).toHaveBeenCalled();
    expect(auth.getProfile).toHaveBeenCalledWith(5);
    expect(users.updateProfile).toHaveBeenCalledWith(5, { phone: '999' });
  });
});
