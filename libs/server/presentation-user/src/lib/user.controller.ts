import { Body, Controller, Post } from "@nestjs/common";
import { ApiBadRequestResponse, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiTags } from "@nestjs/swagger";
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
    description: 'create new user',
  })
  @ApiBadRequestResponse()
  createUser(@Body() userDto: CreateUserDto): Promise<User | undefined> {
    return this.userService.create(userDto, true);
  }
	
}