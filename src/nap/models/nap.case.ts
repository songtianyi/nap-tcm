import { when } from '../models/when'
import { then } from '../models/then'
import { ObjectId } from 'bson';

export class NapCaseModel {
    _id: ObjectId;
    api: string;
    method: string;
    prerequisites: [ObjectId];
    when: when;
    then: then;

}