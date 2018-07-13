import { Get, Controller, HttpStatus, Response, Post, Body, Param, Delete, Res, Put } from '@nestjs/common';
import { NapService } from './service';
import { NapCaseModel } from './models/nap.case'

@Controller('/api/nap/case')
export class NapController {
    constructor(private service: NapService) { }

    // C
    @Post()
    async create(@Body() napCase: NapCaseModel​​) {
        return this.service.create(napCase);
    }

    // R
    @Get("/:_id")
    async getById(@Param() params: any) {
        return this.service.findById(params._id);
    }

    // actions
    @Get("/run/:_id")
    async runById(@Param() params) {
        return this.service.runById(params._id);
    }


    // R
    @Get()
    async getAll() {
        return this.service.findAll();
    }

    // R
    @Post("/select")
    async select(@Body() options) {
        return this.service.select(options)
    }


    @Put()
    async replace(@Body() napCase: NapCaseModel, @Response() res) {
        if (napCase._id == null) {
            res.status(HttpStatus.BAD_REQUEST).json(
                {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: "_id not found"
                }
            )
        }
        await this.service.create(napCase);
        res.status(HttpStatus.OK);
    }

    // D
    @Delete("/:_id")
    async deleteById(@Param() params: any, @Response() res) {
        try {
            await this.service.delete(params._id);
            res.status(HttpStatus.OK).json();
        } catch (e) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
                {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: e.message
                })
        }
    }
}