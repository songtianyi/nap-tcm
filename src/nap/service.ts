import { Model } from 'mongoose';
import { Injectable, Component, HttpService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NapCaseInterface } from './interfaces/nap.case'
import { NapCaseModel } from './models/nap.case';
import { ObjectId } from 'bson';

@Injectable()
export class NapService {
    constructor(@InjectModel('NapCase') private readonly napCaseModel: Model<NapCaseInterface>) { }

    async create(createDto: NapCaseModel): Promise<any> {
        createDto._id = new ObjectId();
        const created = new this.napCaseModel(createDto);
        return await created.save();
    }

    async runById(_id: ObjectId): Promise<any> {
        let instance = await this.findById(_id);
        return this.run(instance);
    }

    private async run(napCase: NapCaseModel) {
        let cache = new Map<ObjectId, any>();
        if (napCase.prerequisites) {
            let res = napCase.prerequisites.forEach(
                pre => {
                    cache.set(pre, this.runById(pre))
                }
            )
        }
        console.log(cache);
        let res = this.request(napCase, cache)
        return { pass: true, message: "OK", instance: napCase, context: res };
    }

    private evaluator(v: string): any {
        if (v.startsWith("#{")) {
            // try replace uuid
        }
    }

    private request(napCase: NapCaseModel, cache: Map<ObjectId, any>): any {
        // http
        if (typeof napCase.when.body === 'string') {
            // evaluate
            this.evaluator(napCase.when.body)
        }
        // do fucking http request
        return "";
    }

    async findAll(): Promise<Array<NapCaseInterface>> {
        return await this.napCaseModel.find({}).exec();
    }

    async select(options): Promise<Array<NapCaseInterface>> {
        return await this.napCaseModel.find(options).exec();
    }

    async findOne(options: Object): Promise<NapCaseInterface | null> {
        return await this.napCaseModel.findOne(options).exec();
    }

    async findById(_id): Promise<NapCaseInterface | null> {
        return await this.napCaseModel.findById(_id).exec();
    }

    async delete(_id: string) {
        console.info("deleting " + _id)
        await this.napCaseModel.findByIdAndRemove(_id).exec();
        let ret = await this.napCaseModel.findOne({ "_id": "5b482944d1bc7469f96729af" })
        if (ret) {
            //刪除失敗
            throw new Error(_id + " still exists in db");
        }
    }
}