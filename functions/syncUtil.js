exports.provisionNewPoolNumber = async function provisionNewPoolNumber(client){
    try{
        let getNumber = await client.availablePhoneNumbers('AU')
        .local
        .list({limit: 1});
        return getNumber;
    }
    catch(error){
        console.log(error);
        return error;
    }
}

exports.createPoolNumberTTL = async function createPoolNumberTTL(TTL,TaskRouterWorkSpace, TaskRouterWorkFlow, TwilioPoolNumber, TWILIO_SYNC_SID, TWILIO_SYNC_RESERVE_SID, client){
    try{
        let taskRouterSID = await client.taskrouter.workspaces(TaskRouterWorkSpace)
        .tasks
        .create({timeout: TTL, attributes: JSON.stringify({
            TWILIO_SYNC_SID: TWILIO_SYNC_SID,
            TWILIO_SYNC_RESERVE_SID: TWILIO_SYNC_RESERVE_SID,
            TwilioPoolNumber: TwilioPoolNumber
         }), workflowSid: TaskRouterWorkFlow});
        console.log(taskRouterSID);
        return taskRouterSID;
    }
    catch(error){
        console.log(error);
        return error;
    }
}
exports.getNumberSID = async function getNumberSID(number,client){
    try{
        console.log(number);
        let sid = await client.incomingPhoneNumbers
        .list({phoneNumber: number, limit: 1})
        console.log(sid[0].sid);
        return(sid[0].sid);
    }
    catch(error){
        console.log(error);
        return error;
    }
}
exports.releaseNumber = async function releaseNumber(SID,client){
    try{
        let result = await client.incomingPhoneNumbers(SID).remove();
        console.log(result);
        return result;
    }
    catch(error){
        console.log(error);
        return error;
    }
}

exports.createNewPoolNumber = async function createNewPoolNumber(number, addressSID, bundleSID, incomingFunction, newNumberName,client){
    try{
        console.log('Get Local AU Numbers');
        let createNumber = await client.incomingPhoneNumbers.create({
            addressSid: addressSID,
            phoneNumber: number,
            voiceUrl:incomingFunction,
            friendlyName: newNumberName
        });
        console.log(createNumber);
        return createNumber;
    }
    catch(error){
        console.log(error);
        return error;
    }
}


exports.createItem = async function createItem(key,TWILIO_SYNC_SID,TWILIO_SYNC_MAP_SID,client){
    try{
        let result = await client.sync.services(TWILIO_SYNC_SID)
           .syncMaps(TWILIO_SYNC_MAP_SID)
           .syncMapItems
           .create({key: key, data: { "status": "AVALIABLE"}});
           console.log(result);
           return result;
           //  return '{"key":"' + key +',"message":"The Key Has Been Created Successfully","code":200}'
    }
    catch(error){
        if(error.status === 54208){
            console.log(error);
            return "item already exists"
        }
        else if(error.code === 54208){
            console.log('Number has already been reserved');
            return error;
        }
        else{
            console.log(error);
            return error;
        }
    }
}

exports.createNewItem = async function createNewItem(key,data,TWILIO_SYNC_SID,TWILIO_SYNC_MAP_SID,client){
    try{
        let result = await client.sync.services(TWILIO_SYNC_SID)
           .syncMaps(TWILIO_SYNC_MAP_SID)
           .syncMapItems
           .create({key: key, data: { "CustomerNumber": data},ttl:240});
           console.log(result);
           return result;
           //  return '{"key":"' + key +',"message":"The Key Has Been Created Successfully","code":200}'
    }
    catch(error){
        if(error.status === 409){
            console.log(error);
            return error;
        }
        if(error.status === 54208){
            console.log(error);
            return "item already exists";
        }
        else if(error.code === 54208){
            console.log('Number has already been reserved');
            return error;
        }
        else{
            console.log(error);
            return error;
        }
    }
}

exports.fetchItem = async function fetchItem(item,TWILIO_SYNC_SID,TWILIO_SYNC_MAP_SID,client){
    try {
        await client.sync.services(TWILIO_SYNC_SID)
            .syncMaps(TWILIO_SYNC_MAP_SID)
            .syncMapItems(item)
            .fetch()
            .then(sync_map_item => {
                console.log('Sync Found');
                console.log(sync_map_item);
                console.log(sync_map_item.data);
                console.log(sync_map_item.data.CustomerNumber);
                result=sync_map_item;
            })
            .catch((error) =>{
                console.log(error);
                result= false;
            });
            return result;
        
    } catch (error) {
        if(error.status === 404){
            return 'No Mapping Found'
        }
        else{
            console.log(error);
            return error
        }
    }
}


exports.createReservation = async function createReservation(TTL,key,CLI,DOB,TWILIO_SYNC_SID,TWILIO_SYNC_MAP_SID,client){
    try {
        //console.log('Updating Item ' + key + ' CLI ' + CLI + ' DOB ' +DOB);
        let result = await client.sync.services(TWILIO_SYNC_SID)
        .syncMaps(TWILIO_SYNC_MAP_SID)
        .syncMapItems
        .create({key: key, data: '{ "CustomerNumber": "'+CLI+'", "CustomerDOB": "'+DOB+'"}'});
        return result;   
    } catch (error) {
        if(error.status === 404){
            console.log(error);
            return error
        }
        else{
            console.log(error);
            return error
        }
    }
}


exports.updateItem = async function updateItem(item,CLI,DOB,TWILIO_SYNC_SID,TWILIO_SYNC_MAP_SID,client){
    try {
       // console.log('Updating Item ' + item + ' CLI ' + CLI + ' DOB ' +DOB);
        let result = await client.sync.services(TWILIO_SYNC_SID)
        .syncMaps(TWILIO_SYNC_MAP_SID)
        .syncMapItems(item)
        .update({data: '{ "CustomerNumber": "'+CLI+'", "DOB": "'+DOB+'"}'})
        return result;   
    } catch (error) {
        if(error.status === 404){
            console.log(error);
            return error
        }
        else{
            console.log(error);
            return error
        }
    }
}

exports.nextItem = async function nextItem(TWILIO_SYNC_SID,TWILIO_SYNC_MAP_SID,client){
    try {
        //Get the next Avaliable Item
        let result;
        await client.sync.services(TWILIO_SYNC_SID)
        .syncMaps(TWILIO_SYNC_MAP_SID)
        .syncMapItems
        .list({order: 'asc', limit: 1})
        .then(syncMapItems => {
                if (syncMapItems.length>0){
                    syncMapItems.forEach(s => {
                    console.log(s.key);
                    result = s.key;
                    })
                }
            });  
         return result;
    } catch (error) {
        if(error.status === 404){
            return 'No Mapping Found'
        }
        else{
            console.log(error);
            return error
        }
    }
}

exports.deleteItem  = async function deleteItem(item,TWILIO_SYNC_SID,TWILIO_SYNC_MAP_SID,client){
    try {
        await client.sync.services(TWILIO_SYNC_SID)
        .syncMaps(TWILIO_SYNC_MAP_SID)
        .syncMapItems(item)
        .remove().then(() => {
            return 'removed';
        }).catch((error) =>{
            console.log(error);
            return error;
        });
    } catch (error) {
            console.log(error);
            return error;
    }
}
