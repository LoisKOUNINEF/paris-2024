/* eslint-disable @typescript-eslint/no-explicit-any */
import { Body, Controller, Get, HttpException, HttpStatus, Post, Request, UseGuards } from "@nestjs/common";
import { ApiBadRequestResponse, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiTags } from "@nestjs/swagger";
import { UserService } from "@paris-2024/server-business-logic-user";
import { CreateUserDto, User } from "@paris-2024/server-data-access-user";
import { AuthenticatedGuard, Admin, Staff } from '@paris-2024/server-business-logic-guards';
import { LocalAuthGuard } from '@paris-2024/server-security-guards';

@ApiTags('auth')
@ApiInternalServerErrorResponse()
@Controller('auth')
export class AuthController {
  constructor(private userService: UserService) {}

  @Post('signup')
  @ApiCreatedResponse({
    type: User,
    description: 'create new user',
  })
  @ApiBadRequestResponse()
  createUser(@Body() userDto: CreateUserDto): Promise<User | undefined> {
    return this.userService.create(userDto, false);
  }

  @Post('login')
	@UseGuards(LocalAuthGuard)
	login(@Request() req: any, err?: Error) {
    if (!req.user) {
    	throw new HttpException('Login failed', HttpStatus.UNAUTHORIZED);
    }
    if (err) {
      return err.message;
    }
    return { message: 'Login successful', user: req.user };
	}

  @Post('logout')
  logout(@Request() req: any): any {
    return new Promise((resolve, reject) => {
      req.logout((err: Error) => {
        if (err) {
          return resolve(err.message);
        }
        resolve({ msg: 'Logged out' });
      });
    });
  }

  @Get('status/is-authenticated')
  @UseGuards(AuthenticatedGuard)
  isAuthenticated(): boolean {
    return true;
  }

  @Get('status/is-admin')
  @Admin(true)
  isAdmin(): boolean {
    return true;
  }

  @Get('status/is-staff')
  @Staff(true)
  isStaff(): boolean {
    return true;
  }

}
