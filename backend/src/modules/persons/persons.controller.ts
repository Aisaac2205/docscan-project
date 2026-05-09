import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PersonsService } from './persons.service';
import {
  CreatePersonDto,
  UpdatePersonDto,
  UpdateProfileOverridesDto,
} from './dto/person.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('persons')
@UseGuards(JwtAuthGuard)
export class PersonsController {
  constructor(private readonly personsService: PersonsService) {}

  @Get()
  list(
    @CurrentUser() user: { id: string },
    @Query('status') status?: string,
    @Query('q') q?: string,
  ) {
    return this.personsService.listAll(user.id, { status, q });
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreatePersonDto) {
    return this.personsService.create(user.id, dto);
  }

  @Get(':id')
  getOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.personsService.getById(user.id, id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdatePersonDto,
  ) {
    return this.personsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    await this.personsService.remove(user.id, id);
  }

  @Get(':id/profile')
  profile(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.personsService.getProfile(user.id, id);
  }

  @Patch(':id/overrides')
  updateOverrides(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateProfileOverridesDto,
  ) {
    return this.personsService.updateOverrides(user.id, id, dto);
  }

  @Get(':id/documents')
  documents(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.personsService.listDocuments(user.id, id);
  }

  @Get(':id/evaluations')
  evaluations(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.personsService.listEvaluations(user.id, id);
  }
}
