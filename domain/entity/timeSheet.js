'use strict';
module.exports = class TimeSheet{

    constructor(id, makerId, email, hourlyRate, clientId, timeIn, timeOut, occupation){
        //upon finishing population of object, send to database.
        //any validity checks will have to occur prior to this.
        this.id = id;
        this.makerId = makerId;
        this.hourlyRate = hourlyRate;
        this.clientId = clientId;
        this.timeIn = timeIn;
        this.timeOut = timeOut;
        this.occupation = occupation;
    }
}