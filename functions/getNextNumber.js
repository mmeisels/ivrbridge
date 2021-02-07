  exports.handler = async function(context, event, callback) {
    const AccountSid = event.accountSID;
    const key = event.key;
    const token = event.token;
    let CustomerNumber = event.CustomerNumber;
    let CustomerDOB = event.CustomerDOB;
    
    if ((token == null) || (key == null)){
      //Unauthenticated - send response as a 401
      let response = new Twilio.Response();
      response.setStatusCode(401);
      response.appendHeader('Content-Type', 'application/json');
      response.setBody({
        'error': 'Unauthorized'
      });
      callback(null, response);
    }else{
      const client = require('twilio')(key, token, { accountSid: AccountSid });
      if (!client){
        //Unauthenticated - send response as a 401
        let response = new Twilio.Response();
        response.setStatusCode(401);
        response.appendHeader('Content-Type', 'application/json');
        response.setBody({
          'error': 'Unauthorized'
        });
        callback(null, response);
      }
      // Required to obtain the path in Twilio functions
      const pathsync = Runtime.getFunctions()['syncUtil'].path
      const sync = require(pathsync)
    
      //The pool number in twilio we are expecting the number to come into.
      let TwilioPoolNumber = event.TwilioPoolNumber; 
      if(event.CustomerNumber)
        CustomerNumber = CustomerNumber.replace('+','');
      let TWILIO_SYNC_SID = context.TWILIO_SYNC_SID; 
      //List of avaliable pool numbers
      let TWILIO_SYNC_POOL_SID = context.TWILIO_SYNC_POOL_SID; 
      //List of reserved numbers
      let TWILIO_SYNC_RESERVE_SID = context.TWILIO_SYNC_RESERVE_SID
      let incomingFunction = context.incomingFunction;
      let newNumberName = context.newNumberName;

      let addressSID = context.addressSID; 
      let bundleSID = context.bundleSID; 


      try {
          let nextNumber = await sync.nextItem(TWILIO_SYNC_SID,TWILIO_SYNC_POOL_SID,client);
          console.log('Get Next Pool Number');
          if (nextNumber !=null){
            if (nextNumber.status=='401'){
              //Unauthenticated - send response as a 401
              let response = new Twilio.Response();
              response.setStatusCode(401);
              response.appendHeader('Content-Type', 'application/json');
              response.setBody({
                'error': 'Unauthorized'
              });
              callback(null, response);
            }else {
                //console.log('Got pool number - reserving '+ nextNumber);
                let deleteItem = await sync.deleteItem(nextNumber,TWILIO_SYNC_SID,TWILIO_SYNC_POOL_SID,client)
                //console.log('Remove Number from Pool '+ deleteItem);
                let createReservation = await sync.createReservation(context.TTL,nextNumber,CustomerNumber,CustomerDOB,TWILIO_SYNC_SID,TWILIO_SYNC_RESERVE_SID,client);
                console.log('Update Reserve '+ createReservation);
                if (createReservation.key === nextNumber){
                    //(TaskRouterWorkSpace, TaskRouterWorkFlow, TwilioPoolNumber, TWILIO_SYNC_SID, TWILIO_SYNC_POOL_SID, client)
                    let createPoolNumberTTL = await sync.createPoolNumberTTL(context.TTL, context.TaskRouterWorkSpace,context.TaskRouterWorkFlow, nextNumber,TWILIO_SYNC_SID,TWILIO_SYNC_RESERVE_SID,client);
                    console.log('CreatedTaskTTL '+ createPoolNumberTTL);
                    callback(null,nextNumber);          
                }else{
                    console.log('Failed To Reserve Number '+ createReservation);
                    callback(null, createReservation);  
                }   
              }        
          }else{
              //No More numbers in the pool - so lets go and buy one and add it to the pool
              console.log('Create Pool Number');
              let findNumber = await sync.provisionNewPoolNumber(client)
              if (findNumber.status=='401'){
                //Unauthenticated - send response as a 401
                let response = new Twilio.Response();
                response.setStatusCode(401);
                response.appendHeader('Content-Type', 'application/json');
                response.setBody({
                  'error': 'Unauthorized'
                });
                callback(null, response);
              }else {
                let createNumber = await sync.createNewPoolNumber(findNumber[0].phoneNumber.replace('+',''),addressSID, bundleSID,incomingFunction,newNumberName, client)
                console.log(createNumber);
                console.log(findNumber[0].phoneNumber.replace('+',''));
                if(createNumber!==null){
                    console.log('Creating Map Item thru ');
                    //If we wanted to provide this to the team to use we would call this... however we want to use it now.
                    //
                    //let FoundInMap1 = await sync.createItem(findNumber[0].phoneNumber.replace('+',''),TWILIO_SYNC_SID,TWILIO_SYNC_POOL_SID,client)  
                    //
                    //Because we want to use it now we will call this one...
                    let createReservation = await sync.createReservation(context.TTL, findNumber[0].phoneNumber.replace('+',''),CustomerNumber,CustomerDOB,TWILIO_SYNC_SID,TWILIO_SYNC_RESERVE_SID,client);
                    let createPoolNumberTTL = await sync.createPoolNumberTTL(context.TTL, context.TaskRouterWorkSpace,context.TaskRouterWorkFlow, findNumber[0].phoneNumber.replace('+',''),TWILIO_SYNC_SID,TWILIO_SYNC_RESERVE_SID,client);
                    callback(null,createReservation.key);
                }
                else{
                    callback(null,'Error Provisioning Number');
                }
              }
              //callback(null,'Error: No More Pool Numbers - please retry or add more pool numbers');    
          }
      } catch (error) {
              console.log(error);
              callback(error);
      }
      //let FoundInMap = await sync.createItem(TwilioPoolNumber,CustomerNumber,TWILIO_SYNC_SID,TWILIO_SYNC_MAP_SID,client)
    }
  };
  