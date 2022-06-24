import { WooferDataLayer } from '../dataLayer/WooferDataLayer'
// import { AttachmentUtils } from '../helpers/attachmentUtils';
import { Woofer } from '../models/Woofer'
import { CreateWooferRequest } from '../requests/CreateWooferRequest'
import { UpdateWooferRequest } from '../requests/UpdateWooferRequest'
import { createLogger } from '../utils/logger'

import * as uuid from 'uuid'
// import * as createError from 'http-errors'
import * as utils from '../lambda/utils';

// TODO: Implement businessLogic
const logger = createLogger('woofersLog');
const wooferDataLayer = new WooferDataLayer();
export const getWoofers = async (event): Promise<Woofer[]> => {

    logger.info('getWoofers', {event});

    const woofer: Woofer = {
        dogId: utils.getDogId(event)
    };

    return wooferDataLayer.getAllWoofers(woofer);
}

export const createWoofer = async (event):Promise<Woofer>  => {
    logger.info('createWoofer', {event});

    const newWoofer: CreateWooferRequest = JSON.parse(event.body);

    const woofer: Woofer = {
        dogId: utils.getDogId(event),
        wooferId: uuid.v4(),
        createdAt: new Date().toDateString(),
        name: newWoofer.name,
        dueDate: newWoofer.dueDate,
        done: false,
        attachmentUrl: '',
    };

    return wooferDataLayer.createDataWoofer(woofer);

}

export const deleteWoofer = async(event): Promise<String> => {
    logger.info('deleteWoofer', {event});

    const woofer: Woofer = {
        dogId: utils.getDogId(event),
        wooferId: event.pathParameters.wooferId
    };

    return wooferDataLayer.deleteDataWoofer(woofer);
}

export const updateWoofer = async (event):Promise<String> => {
    logger.info('updateWoofer', {event});

    const wooferUpdate: UpdateWooferRequest = JSON.parse(event.body);

    const woofer: Woofer = {
        dogId: utils.getDogId(event),
        wooferId: event.pathParameters.wooferId,
        name: wooferUpdate.name,
        dueDate: wooferUpdate.dueDate,
        done: wooferUpdate.done
    };

    return wooferDataLayer.updateDataWoofer(woofer);
}

export const generateUploadUrl = (event): Promise<String> => {
    logger.info('generateUploadUrl', {event});

    const woofer: Woofer = {
        dogId: utils.getDogId(event),
        wooferId: event.pathParameters.wooferId
    };

    return wooferDataLayer.generateUploadUrl(woofer);
}