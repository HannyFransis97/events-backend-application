import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './event.entity';
import { Like, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendee } from './attendee.entity';
import { EventsService } from './events.service';
import { ListEvents } from './dto/list.event';

@Controller('/events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);
  constructor(
    @InjectRepository(Event)
    private readonly repository: Repository<Event>,
    @InjectRepository(Attendee)
    private readonly attendeeRepository: Repository<Attendee>,
    private readonly eventsService: EventsService,
  ) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() filter: ListEvents) {
    const events =
      await this.eventsService.getEventsWithAttendeeCountFilteredPagination(
        filter,
        {
          total: true,
          currentPage: filter.page,
          limit: 2,
        },
      );

    return events;
  }

  @Get('/practice')
  async practice() {
    return await this.repository.find({
      select: ['id', 'when'],
      where: [
        {
          id: MoreThan(3),
          when: MoreThan(new Date('2021-02-12T13:00:00')),
        },
        {
          description: Like('%meet%'),
        },
      ],
      take: 2,
      order: {
        id: 'DESC',
      },
    });
  }

  @Get('/practice2')
  async practice2() {
    const event = await this.repository.findOne({
      where: { id: 1 },
      relations: ['attendees'],
    });
    // Associating Related Entities
    // const event = new Event();
    // event.id = 1;

    const attendee = new Attendee();
    attendee.name = 'Jerry the third';
    // attendee.event = event;

    event.attendees.push(attendee);

    await this.repository.save(event);
    // await this.attendeeRepository.save(attendee);
    // return event;
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const event = await this.eventsService.getEvents(id);
    if (!event) {
      throw new NotFoundException();
    }
    return event;
  }

  @Post()
  async create(
    // @Body(new ValidationPipe({ groups: ['create'] })) body: CreateEventDto,
    @Body() body: CreateEventDto,
  ) {
    return await this.repository.save({
      ...body,
      when: new Date(body.when),
    });
  }

  @Patch(':id')
  async upadte(
    @Param('id', ParseIntPipe) id: number,
    // @Body(new ValidationPipe({ groups: ['update'] })) body: UpdateEventDto,
    @Body() body: UpdateEventDto,
  ) {
    const event = await this.repository.findOneBy({ id: id });

    if (!event) {
      throw new NotFoundException();
    }

    return await this.repository.save({
      ...event,
      ...body,
      when: body.when ? new Date(body.when) : event.when,
    });
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.eventsService.deleteEvent(id);
    if (result?.affected !== 1) {
      throw new NotFoundException();
    }
  }
}
