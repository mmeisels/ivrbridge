  exports.handler = async function(context, event, callback) {
    const AccountSid = '';
    //const key = event.key;
    //const token = event.token;
    const key = '';
    const token = '';
    
    if ((token == null) || (key == null)){
      callback(null,'Unauthorized');
    }
    const client = require('twilio')(key, token, { accountSid: AccountSid });
    
    // Required to obtain the path in Twilio functions
    const pathsync = Runtime.getFunctions()['syncUtil'].path
    const sync = require(pathsync)
   
    //The pool number in twilio we are expecting the number to come into.
    let TwilioPoolNumber = event.TwilioPoolNumber; 

    
    let TWILIO_SYNC_SID = context.TWILIO_SYNC_SID; 
    let TWILIO_SYNC_POOL_SID = context.TWILIO_SYNC_POOL_SID; 
    
    
    //let nextNumber = await sync.nextItem(CLI,DOB,TWILIO_SYNC_SID,TWILIO_SYNC_MAP_SID,client);
    console.log('Create Fake Reservation Number');
    let FoundInMap = await sync.createItem(TwilioPoolNumber,TWILIO_SYNC_SID,TWILIO_SYNC_POOL_SID,client)
    console.log(FoundInMap);
    

    callback(null,FoundInMap);
  };
  