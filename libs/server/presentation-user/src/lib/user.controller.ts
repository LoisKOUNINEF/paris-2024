import { Body, Controller, Post } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiTags } from "@nestjs/swagger";
import { UserService } from "@paris-2024/server-business-logic-user";
import { CreateUserDto, User } from "@paris-2024/server-data-access-user";
import { Admin } from '@paris-2024/server-business-logic-guards';

@ApiTags('users')
@ApiInternalServerErrorResponse()
@Controller('users')
export class UserController {
	constructor(private userService: UserService) {}

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
	
}