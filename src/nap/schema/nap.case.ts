
import * as mongoose from 'mongoose';

export const NapCaseSchema = new mongoose.Schema({
    _id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
    },
    api: {
        type: String,
        required: true,
    },
    method: {
        type: String,
        required: true,
    },
    prerequisites: {
        type: [mongoose.SchemaTypes.ObjectId],
        required: true,  // it could be empty
    },
    when: {
        type: {
            headers: {
                type: Map,
                required: false,
            },
            params: {
                type: String,
                required: true, // if no params, it shoud be empty string
            },
            body: {
                type: Object, // string or Map<string, any>
                required: false,
            }
        },
        required: true,
    },
    then: {
        type: {
            status: {
                type: Number,
                required: true,
            },
            headers: {
                type: Map,
                required: true,
            },
            body: {
                type: Object,
                required: false, // it could no data in response body
            },
        },
        required: true,
    },
});