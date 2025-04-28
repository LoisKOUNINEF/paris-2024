import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiResponse, ApiTags } from "@nestjs/swagger";
import { BundleService } from "@paris-2024/server-business-logic-bundle";
import { Bundle, CreateBundleDto, UpdateBundleDto } from "@paris-2024/server-data-access-bundle";
import { IBundleSales } from "@paris-2024/shared-interfaces";
import { Admin } from '@paris-2024/server-business-logic-guards'

@ApiTags('bundles')
@ApiInternalServerErrorResponse()
@Controller('bundles')
export class BundleController {
  constructor(private bundleService: BundleService) {}

  @Admin(true)
  @Post()
  @ApiCreatedResponse({
    type: Bundle,
    description: 'creates new bundle',
  })
  @ApiBody({
    type: CreateBundleDto,
    description: 'Bundle informations',
  })
  @ApiBadRequestResponse()
  createCart(@Body() dto: CreateBundleDto): Promise<Bundle | undefined> {
    return this.bundleService.createBundle(dto);
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'returns all bundles',
  })
  getBundles(): Promise<Array<Bundle> | Bundle | null> {
    return this.bundleService.getBundles();
  }

  @Admin(true)
  @Get('sales')
  @ApiResponse({
    status: 200,
    description: 'returns sales for all bundles',
  })
  getAllSales(): Promise<Array<IBundleSales> | undefined> {
    return this.bundleService.getAllWithSales();
  }

  @Admin(true)
  @Get('sales/:id')
  @ApiResponse({
    status: 200,
    description: 'returns sales for one bundle',
  })
  getOneSales(@Param('id') id: string): Promise<IBundleSales | undefined> {
    return this.bundleService.getOneWithSales(id);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'returns a specific bundle',
  })
  getBundle(@Param('id') id: Bundle['id']): Promise<Bundle | null> {
    return this.bundleService.getOneById(id);
  }

  @Admin(true)
  @Patch(':id')
  @ApiBody({
    type: UpdateBundleDto,
  })
  @ApiBadRequestResponse()
  updateBundle(@Body() dto: UpdateBundleDto, @Param('id') id: string): Promise<Bundle | null> {
    return this.bundleService.updateBundle(id, dto);
  }

  @Admin(true)
  @Delete(':id')
  @ApiBody({
    type: UpdateBundleDto,
  })
  @ApiBadRequestResponse()
  deleteBundle(@Param('id') id: string): Promise<Bundle | undefined> {
    return this.bundleService.remove(id);
  }
}