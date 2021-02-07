exports.handler = async function(context, event, callback) {
    const client = context.getTwilioClient();
   
    const pathsync = Runtime.getFunctions()['syncUtil'].path
    const sync = require(pathsync)
    let URL=context.URL;
    let TwilioPoolNumber = event.To;
    TwilioPoolNumber=TwilioPoolNumber.replace('+', ''); 
    let TWILIO_SYNC_SID = context.TWILIO_SYNC_SID; 
    let TWILIO_SYNC_POOL_SID = context.TWILIO_SYNC_POOL_SID; 
    let TWILIO_SYNC_RESERVE_SID = context.TWILIO_SYNC_RESERVE_SID; 
    
    let twiml = new Twilio.twiml.VoiceResponse();
	//Replace with TwilioPoolNumber
    // console.log(TwilioPoolNumber);
    let sync_map_item_get = await sync.fetchItem(TwilioPoolNumber,TWILIO_SYNC_SID,TWILIO_SYNC_RESERVE_SID,client)
    // console.log(sync_map_item_get);
    if (sync_map_item_get){
        //If we successfully got the pool details... lets remove it.
        let sync_map_item_delete = await sync.deleteItem(TwilioPoolNumber,TWILIO_SYNC_SID,TWILIO_SYNC_RESERVE_SID,client)
        // console.log(sync_map_item_delete);
        //Add the number back to the other pool so it can be reused.
        let sync_map_item_release = await sync.createItem(TwilioPoolNumber,TWILIO_SYNC_SID,TWILIO_SYNC_POOL_SID,client)
        // console.log(sync_map_item_release);
        console.log(sync_map_item_get.data.CustomerNumber);
        if (context.debugEnabled=='true'){
            console.log(context.debugEnabled);
            const say = twiml.say({
                voice: 'Polly.Nicole'
            }, 'Customer Number is');
            say.sayAs({'interpret-as':'digits'}, sync_map_item_get.data.CustomerNumber);      
            say.w('Customer DOB is');
            say.sayAs({'interpret-as': 'digits'}, sync_map_item_get.data.CustomerDOB);      
            // twiml.sayAs({
            //     'interpret-as': 'date',
            //     role: 'yyyymmdd'
            // }, sync_map_item_get.data.CustomerDOB);  
        }else{
            console.log(context.debugEnabled);
        }
        
        // console.log(sync_map_item_get.data.CustomerDOB);
        twiml.redirect(
        {
            method: "POST",
        },
        `${URL}?CustomerCLI=${sync_map_item_get.data.CustomerNumber}&CustomerDOB=${sync_map_item_get.data.CustomerDOB}`
        );
    }else{
        console.log(' Number not found - passing with no  Customer CLI');
        //twiml.say("Your number was not found in the reserved Pool. We are connecting you as an unathenticated caller.");
        twiml.redirect(
        {
            method: "POST",
        },
        `${URL}`
        );
    }
	return callback(null, twiml);
}
