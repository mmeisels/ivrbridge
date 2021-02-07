  exports.handler = async function(context, event, callback) {
    console.log(event);  
    const pathsync = Runtime.getFunctions()['syncUtil'].path
    const sync = require(pathsync)
   
    if (event.EventType==="task.canceled"){
      //console.log('Task Canceled');
      const accountSid = context.ACCOUNT_SID;
      const authToken = context.AUTH_TOKEN;
      const client = require('twilio')(accountSid, authToken);
      
      const obj = JSON.parse(event.TaskAttributes);
      //console.log(obj);
      //console.log('Task Call For Creation ' + obj.name);
      let TwilioPoolNumber = obj.TwilioPoolNumber;
      let TWILIO_SYNC_SID = obj.TWILIO_SYNC_SID;
      let TWILIO_SYNC_POOL_SID = context.TWILIO_SYNC_POOL_SID;
      let TWILIO_SYNC_RESERVE_SID = obj.TWILIO_SYNC_RESERVE_SID;
      let sync_map_item_get = await sync.fetchItem(TwilioPoolNumber,TWILIO_SYNC_SID,TWILIO_SYNC_RESERVE_SID,client)
      if (sync_map_item_get){
        //console.log(sync_map_item_get);
        d = new Date();
        let utc = new Date(d.getTime() - (context.TTL));
        //console.log(utc);
        //console.log(sync_map_item_get.dateCreated);
        if (sync_map_item_get.dateCreated <= utc){
          //console.log('Checking Token for Expiry. Token InValid Remove:' + sync_map_item_get.dateExpires);
          //console.log('Orphaned Item');
          //// *** Delete the Reservation.
          let sync_map_item_delete = await sync.deleteItem(TwilioPoolNumber,TWILIO_SYNC_SID,TWILIO_SYNC_RESERVE_SID,client)
          //console.log('Delete Old Reservation ' + sync_map_item_delete);
          /// *** Add the number back to the other pool so it can be reused.
          let sync_map_item_release = await sync.createItem(TwilioPoolNumber,TWILIO_SYNC_SID,TWILIO_SYNC_POOL_SID,client)
          //console.log('Add Back to PoolNumbers ' + sync_map_item_release);
          callback(null,sync_map_item_release);
        }
        else{
          //console.log('Still a valid token and not expired.');
          callback(null,'Still Valid');
        }
      }else{
        //console.log('No Reservation There');
        callback(null,'No Reservation there');
      }
      //let FoundInMap1 = await sync.createItem('61386098357',TWILIO_SYNC_SID,TWILIO_SYNC_POOL_SID,client)
    }
    else if (event.EventType==="task.completed"){
      //console.log('Task Completed');
      callback(null,event);
      
    }
    callback(null,event);
}