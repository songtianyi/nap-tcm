import { Model } from 'mongoose';
import { Injectable, Component, HttpService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NapCaseInterface } from './interfaces/nap.case'
import { NapCaseModel } from './models/nap.case';
import { ObjectId } from 'bson';
import * as request from 'request';
import * as rp from 'request-promise-native'
import { format, isRegExp, isError } from 'util';
import { IncomingMessage } from 'http';
import { relative } from 'path';

@Injectable()
export class NapService {
    constructor(@InjectModel('NapCase') private readonly napCaseModel: Model<NapCaseInterface>) { }

    async create(createDto: NapCaseModel): Promise<any> {
        if (!createDto._id) {
            createDto._id = new ObjectId();
        }
        const created = new this.napCaseModel(createDto);
        return await created.save();
    }

    async update(updateDto: NapCaseModel): Promise<any> {
        console.log("updating..")
        return await this.napCaseModel.update({ _id: updateDto._id }, updateDto).exec();
    }

    async runById(_id: ObjectId): Promise<any> {
        let instance = await this.findById(_id);
        if (!instance) {
            throw new Error(format('instance', _id, 'not found'))
        }
        console.log("run", instance)
        return await this.run(instance);
    }

    private async run(instance: NapCaseModel) {
        let cache = new Map<string, any>();
        if (instance.prerequisites) {
            for (let v of instance.prerequisites) {
                cache.set(v.toHexString(), await this.runById(v))
            }
        }
        // evaluate instance
        // evalute uri
        instance.api = this.evaluator(instance.api, cache)
        if (instance.when.headers) {
            for (let k in instance.when.headers) {
                let replaced = this.evaluator(instance.when.headers[k], cache)
                instance.when.headers[k] = replaced;
                console.log('headers', instance.when.headers);
            }
        }
        if (instance.when.body) {
            instance.when.body = this.evaluator(instance.when.body, cache)
        }
        let response = await this.doRequest(instance, cache)
        let ret = this.comparator(instance, response)
        if (isError(ret)) {
            return { pass: false, message: ret.message, instance: instance, response: response };
        } else {
            return { pass: true, message: "OK", instance: instance, response: response };
        }
    }

    private compareElement(key: String, expect: any, found: any): Error | null {
        if ((expect == null) != (found == null)) {
            return this.expectError(k, expect, found);
        }
        return null;
    }
    private expectError(k, expect, found): Error {
            return new Error(format("key:", k, "expect", expect, "but found", found))
    }
    private comparator(instance: NapCaseModel, response: any): Error | any {
        // compare status code
        if (instance.then.statusCode != response.statusCode) {
            return new Error(format("statusCode:", 'expect', instance.then.statusCode, 'but found', response.statusCode))
        }
        // compare headers
        if (instance.then.headers) {
            for (let k in instance.then.headers) {
                let expect = instance.then.headers[k]
                let is = response.headers[k]
                // it couldn't be context pattern, so null is ok.
                let ev = this.evaluator(expect, null)
                if (isRegExp(ev)) {
                    if (!ev.test(is)) {
                        return Error(format('headers.' + k + ':', 'expect match pattern', expect, 'but found', is))
                    }
                } else {
                    if (expect != is) {
                        return new Error(format('headers.' + k + ':', 'expect', expect, 'but found', is))
                    }
                }
            }
        }
        // compare body
        if (instance.then.body) {
            if (response.body == null) {
                return this.expectError("body", "not null", "null");
            }
            for (let k in instance.then.body) {
                let v = instance.then.body.get(k)
                let e = this.compareElement(k, v, response.body.get(k))
                if (e != null) return e;
            }
        }
        return true;
    }

    private evaluator(v: any, cache: Map<string, any>): any {
        if (typeof v === 'string') {
            // regex case
            let patRegex = new RegExp('\\$regex{(.*)}')
            let ctxRegex = new RegExp('\\$context{([a-f\\d]{24})((\\.[a-zA-Z\\[\\]\\(\\)0-9]+)+)}')
            if (patRegex.test(v)) {
                console.log("pattern")
                return new RegExp(patRegex.exec(v)[1])
            } else if (ctxRegex.test(v)) {
                console.log('context')
                let arr = ctxRegex.exec(v)
                console.log(arr)
                let uuid = arr[1]
                let attr : string = arr[2]
                let obj = cache.get(uuid)
                let str = 'obj.response'  + attr
                let evaluated = eval(str)
                if (typeof evaluated === 'string') {
                    return v.replace(arr[0], evaluated)
                }else{
                    return evaluated;
                }
            } else return v;
        }else {
            return v;
        }
    }

    private async doRequest(instance: NapCaseModel, cache: Map<string, any>): Promise<IncomingMessage> {
        // do fucking http request
        let uri = "http://192.168.1.99" + instance.api
        if (instance.when.params) {
            uri += '/' + instance.when.params;
        }
        console.log('u', uri)
        var options = {
            method: instance.method.toUpperCase(),
            uri: uri,
            body: instance.when.body,
            headers: instance.when.headers,
            resolveWithFullResponse: true,
            json: true
        };
        let ret: any;
        await rp(options)
            .then(function (response) {
                // succeeded...
                ret = response
            })
            .catch(function (err) {
                // failed...
                ret = err.response
            })
        return ret;
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

    async deleteAll() {
        console.log("delete all");
        await this.napCaseModel.remove({}).exec();
    }
}