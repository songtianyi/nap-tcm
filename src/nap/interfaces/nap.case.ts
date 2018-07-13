import { Document } from 'mongoose';
import { when } from '../models/when'
import { then } from '../models/then'
import { ObjectId } from 'bson';



export interface NapCaseInterface extends Document {
    readonly _id: ObjectId;
    readonly api: string;
    readonly method: string;
    readonly prerequisites: [ObjectId];
    readonly when: when;
    readonly then: then;

}