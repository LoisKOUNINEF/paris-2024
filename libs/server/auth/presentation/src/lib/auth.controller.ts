/* eslint-disable @typescript-eslint/no-explicit-any */
import { Body, Controller, Get, HttpException, HttpStatus, Post, Request, UseGuards, Headers, Param } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserService } from "@paris-2024/server-business-logic-user";
import { CreateUserDto, LoginDto, User } from "@paris-2024/server-data-access-user";
import { AuthenticatedGuard, Admin, Staff } from '@paris-2024/server-business-logic-guards';
import { LocalAuthGuard } from '@paris-2024/server-security-guards';
import { RequestWithUser } from "@paris-2024/server-base-entity";
import { CartService } from "@paris-2024/server-business-logic-cart";

@ApiTags('auth')
@ApiInternalServerErrorResponse()
@Controller('auth')
export class AuthController {
  constructor(
    private userService: UserService, 
    private cartService: CartService,
  ) {}

  @Post('signup')
  @ApiCreatedResponse({
    type: User,
    description: 'create new user',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'Json structure for User object',
  })
  @ApiBadRequestResponse()
  createUser(
    @Body() userDto: CreateUserDto,
    @Headers('x-guest-token') guestToken: string |undefined,
    ): Promise<User | undefined> {
    return this.userService.create(userDto, false, guestToken);
  }

  @Post('login')
	@UseGuards(LocalAuthGuard)
  @ApiBody({
    type: LoginDto,
  })
	async login(
    @Request() req: RequestWithUser, 
    @Headers('x-guest-token') guestToken: string,
    err?: Error
  ) {
    if (!req.user) {
    	throw new HttpException('Login failed', HttpStatus.UNAUTHORIZED);
    }
    if (err) {
      return err.message;
    }
    if (req.user.id){
      await this.cartService.mergeGuestCartWithUserCart({ userId: req.user?.id, guestToken })
    }
    return { message: 'Login successful', user: req.user };
	}

  @Post('logout')
  logout(@Request() req: RequestWithUser): any {
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
  @ApiResponse({ status: 201, description: 'User is authenticated.' })
  @ApiResponse({ status: 403, description: 'User is not authenticated.' })
  isAuthenticated(): boolean {
    return true;
  }

  @Get('status/is-admin')
  @Admin(true)
  @ApiResponse({ status: 201, description: 'User is administrator.' })
  @ApiResponse({ status: 403, description: 'User is not administrator.' })
  isAdmin(): boolean {
    return true;
  }

  @Get('status/is-staff')
  @Staff(true)
  @ApiResponse({ status: 201, description: 'User is a staff member.' })
  @ApiResponse({ status: 403, description: 'User is not a staff member.' })
  isStaff(): boolean {
    return true;
  }

  @Get('verify-email/:token')
  async verifyEmail(@Param('token') token: string,): Promise<boolean> {
    const valid = await this.userService.verifyEmail(token);
    if(!valid) {
      return false;
    }
    return true;
  }

}
