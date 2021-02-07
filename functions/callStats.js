exports.handler = async function(context, event, callback) {
    const accountSid = context.ACCOUNT_SID;
    const authToken = context.AUTH_TOKEN;
    // 
    console.log(event.mode);
    const client = require('twilio')(accountSid,authToken);
    //const client1 = require('twilio')(accountSid,authToken);
    let duartion=0;
    let calls=0;
    var data={};
    var callsResult=[];
    const numbersResult = await resolveNumbers(client,'Dev');
    for (const number of numbersResult){
        callsResult.push(await resolveCalls('Dev',number,client));
    }
    const numbersProdResult = await resolveNumbers(client,'Prod');
    for (const prodNumber of numbersProdResult){
        callsResult.push(await resolveCalls('Prod',prodNumber,client));
    }
    console.log(callsResult);
    callback(null,callsResult);
    
    //let callsResult = await resolveCalls(client);
    //console.log('returned ' + result);

    // client.calls
    // .list({
    //    to: event.phoneNumber,
    //    status: 'completed'
    //  })
    // .then(calls => calls.forEach(c => console.log(c.sid)));
};

function resolveCalls(mode,number,client) {
    return new Promise(resolve => {
        client.calls
        .list({
            to: number,
            status: 'completed'
        })
        .then(calls => {
            numCalls=parseInt(calls.length);
            duration=0;
            calls.forEach(c => 
            {
                duration= duration + parseInt(c.duration);
            })
            if (mode=='Dev')
                newMode = 'Test';
            else
                newMode=mode;
            resolve({'mode':newMode,'phoneNumber':number,'calls': numCalls,'duration':duration});
        })
        .catch(error => {
            console.log(error);
            resolve(error);
        })
    })
}


function resolveNumbers(client,mode) {
    return new Promise(resolve => {
        let duartion=0;
        let calls=0;
        numbers=[];
        client.incomingPhoneNumbers
        .list({friendlyName: 'Auto Provisioned By Twilio '+mode})
        .then(incomingPhoneNumbers => {
            incomingPhoneNumbers.forEach(i => 
            {
                console.log(mode);
                console.log(i.phoneNumber);
                 
                numbers.push(i.phoneNumber);
            })
            resolve(numbers);
        })
        .catch(error => {
            console.log(error);
            resolve(error);
        })

    })
}