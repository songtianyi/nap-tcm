import { Get, Controller, HttpStatus, Response, Post, Body, Param, Delete, Res, Put } from '@nestjs/common';
import { NapService } from './service';
import { NapCaseModel } from './models/nap.case'
import { format } from 'util';

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
    async runById(@Param() params, @Response() res) {
        try {
            res.status(HttpStatus.OK).json(await this.service.runById(params._id));
        }catch(e) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
                {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: e.message
                }
            )
        }
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


    @Put("/:_id")
    async replace(@Param() params, @Body() napCase: NapCaseModel, @Response() res) {
        if (napCase._id == null) {
            res.status(HttpStatus.BAD_REQUEST).json(
                {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: "_id not found"
                }
            )
        }
        if (napCase._id != params._id) {
            res.status(HttpStatus.BAD_REQUEST).json(
                {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: format("params._id", params._id, 'not equal with', napCase._id)
                }
            )
        }
        this.service.update(napCase);
        res.status(HttpStatus.OK).json(await this.service.update(napCase))
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

    @Delete()
    async deleteAll() {
        await this.service.deleteAll();
    }
}