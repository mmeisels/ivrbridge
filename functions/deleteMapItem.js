  exports.handler = async function(context, event, callback) {
    const AccountSid = 'ACXXXXXX';
    const key = event.key;
    const token = event.token;
    
    if ((token == null) || (key == null)){
      callback(null,'Unauthorized');
    }
    const client = require('twilio')(key, token, { accountSid: AccountSid });
    
   
    let TwilioPoolNumber = event.TwilioPoolNumber;
    TwilioPoolNumber=TwilioPoolNumber.replace('+', ''); 
    let TWILIO_SYNC_SID = context.TWILIO_SYNC_SID; 
    let TWILIO_SYNC_MAP_SID = context.TWILIO_SYNC_MAP_SID; 
    
    
    let FoundInMap = await sync.deleteItem(TwilioPoolNumber,TWILIO_SYNC_SID,TWILIO_SYNC_MAP_SID,client)
    if (FoundInMap){
        callback(null,'Success');
    }else{
        callback(null,'Error');
    }

  };
  