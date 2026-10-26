import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Request, ValidationPipe } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { UserService } from "@paris-2024/server-business-logic-user";
import { CreateUserDto, UpdateUserDto, User } from "@paris-2024/server-data-access-user";
import { Admin, CurrentUser, Owner, OwnerCheck } from '@paris-2024/server-business-logic-guards';
import { RequestWithUser } from "@paris-2024/server-base-entity";

@ApiTags('users')
@ApiInternalServerErrorResponse()
@Controller('users')
export class UserController {
	constructor(private userService: UserService) {}

  @Get()
  @Admin(true)
  @ApiOkResponse({
    type: User,
    isArray: true,
  })
  getUsers(): Promise<Array<User>> {
    return this.userService.findAll();
  }


  @Get('current')
  getCurrentUser(@Request() req: RequestWithUser, ): Promise<User | undefined> {
    if(!req.user || !req.user.id) {
      throw new HttpException('No user is logged in.', HttpStatus.UNAUTHORIZED)
    }
    return this.userService.findOne(req.user.id);
  }

  @Patch(':id')
  @ApiOkResponse({
    type: User,
    description: 'returns updated user',
  })  
  @Owner({
    paramKey: 'id',
    entityService: UserService,
    findMethod: 'findOne',
    ownershipField: 'id',
  })
  @OwnerCheck(true)
  updateUser(
    @CurrentUser() user: RequestWithUser["user"],
    @Param('id') id: User['id'],
    // reject fields that are not in the dto, such as role or emailVerified
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) dto: UpdateUserDto,
  ): Promise<User | null> {
    if(!user || !user.id) {
      throw new HttpException('', HttpStatus.UNAUTHORIZED)
    }
    // OwnerGuard lets admins through: target the :id param, not the caller
    return this.userService.update(id, dto)
  }

  @Post()
  @Admin(true)
  @ApiCreatedResponse({
    type: User,
    description: 'Created new User object',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'Json structure for User object',
  })
  @ApiBadRequestResponse()
  createUser(@Body() userDto: CreateUserDto): Promise<User | undefined> {
    return this.userService.create(userDto, true);
  }

  @Delete(':id')
  @ApiOkResponse({
    type: User,
    description: 'soft removes designated user',
  })  
  @Owner({
    paramKey: 'id',
    entityService: UserService,
    findMethod: 'findOne',
    ownershipField: 'id',
  })
  @OwnerCheck(true)
  deleteUser(
    @CurrentUser() user: RequestWithUser["user"],
    @Param('id') id: User['id'],
    @Request() req: RequestWithUser,
  ): Promise<User | undefined> {
    if(!user || !user.id) {
      throw new HttpException('', HttpStatus.UNAUTHORIZED)
    }
    return this.deleteAndLogout(user.id, id, req);
  }

  private async deleteAndLogout(currentUserId: string, id: User['id'], req: RequestWithUser): Promise<User | undefined> {
    const deleted = await this.userService.delete(id);

    // the session caches the user: a deleted account must not keep acting through it
    if (currentUserId === id) {
      await new Promise<void>((resolve, reject) => {
        req.logout((err: Error) => err ? reject(err) : resolve());
      });
    }

    return deleted;
  }
	
}